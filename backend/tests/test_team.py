from tests.conftest import register_and_login


async def test_list_members_includes_only_own_tenant(client):
    admin_headers = await register_and_login(client, "team-list-a", "admin@team-list-a.example.com")
    await register_and_login(client, "team-list-b", "admin@team-list-b.example.com")

    resp = await client.get("/api/v1/team/members", headers=admin_headers)
    assert resp.status_code == 200
    emails = {m["email"] for m in resp.json()}
    assert emails == {"admin@team-list-a.example.com"}


async def test_agent_cannot_list_or_invite(client):
    admin_headers = await register_and_login(client, "team-agent-a", "admin@team-agent-a.example.com")
    invite = await client.post(
        "/api/v1/team/invite", headers=admin_headers,
        json={"email": "agent@team-agent-a.example.com", "role": "agent"},
    )
    assert invite.status_code == 201

    accept = await client.post("/api/v1/team/accept-invite", json={
        "token": _invitation_token(invite), "password": "password123",
    })
    assert accept.status_code == 201
    agent_headers = {"Authorization": f"Bearer {accept.json()['access_token']}"}

    forbidden = await client.get("/api/v1/team/members", headers=agent_headers)
    assert forbidden.status_code == 403

    forbidden_invite = await client.post(
        "/api/v1/team/invite", headers=agent_headers,
        json={"email": "someone-else@team-agent-a.example.com", "role": "agent"},
    )
    assert forbidden_invite.status_code == 403


def _invitation_token(invite_resp):
    # POST /team/invite is the only place the accept token is ever returned
    # (there's no email provider to deliver it) -- see InviteCreateOut.
    return invite_resp.json()["token"]


async def test_invite_then_accept_creates_member_with_invited_role(client):
    admin_headers = await register_and_login(client, "team-invite-a", "admin@team-invite-a.example.com")

    invite = await client.post(
        "/api/v1/team/invite", headers=admin_headers,
        json={"email": "newhire@team-invite-a.example.com", "role": "manager"},
    )
    assert invite.status_code == 201
    assert invite.json()["status"] == "pending"

    pending = await client.get("/api/v1/team/invitations", headers=admin_headers)
    assert len(pending.json()) == 1
    assert "token" not in pending.json()[0]  # secret only ever returned once, from POST /invite

    accept = await client.post("/api/v1/team/accept-invite", json={
        "token": _invitation_token(invite), "password": "password123", "name": "New Hire",
    })
    assert accept.status_code == 201

    login = await client.post("/api/v1/auth/login", json={
        "email": "newhire@team-invite-a.example.com", "password": "password123",
    })
    assert login.status_code == 200
    me = await client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {login.json()['access_token']}",
    })
    assert me.json()["role"] == "manager"

    # Invitation is consumed -- no longer pending, and can't be reused.
    pending_after = await client.get("/api/v1/team/invitations", headers=admin_headers)
    assert pending_after.json() == []
    reuse = await client.post("/api/v1/team/accept-invite", json={
        "token": _invitation_token(invite), "password": "password123",
    })
    assert reuse.status_code == 404


async def test_invite_rejects_existing_account_and_duplicate_pending(client):
    admin_headers = await register_and_login(client, "team-dupe-a", "admin@team-dupe-a.example.com")

    existing_account = await client.post(
        "/api/v1/team/invite", headers=admin_headers,
        json={"email": "admin@team-dupe-a.example.com", "role": "agent"},
    )
    assert existing_account.status_code == 409

    first = await client.post(
        "/api/v1/team/invite", headers=admin_headers,
        json={"email": "dupe@team-dupe-a.example.com", "role": "agent"},
    )
    assert first.status_code == 201
    second = await client.post(
        "/api/v1/team/invite", headers=admin_headers,
        json={"email": "dupe@team-dupe-a.example.com", "role": "agent"},
    )
    assert second.status_code == 409


async def test_revoke_invitation(client):
    admin_headers = await register_and_login(client, "team-revoke-a", "admin@team-revoke-a.example.com")

    invite = await client.post(
        "/api/v1/team/invite", headers=admin_headers,
        json={"email": "gone@team-revoke-a.example.com", "role": "agent"},
    )
    invite_id = invite.json()["id"]

    revoke = await client.delete(f"/api/v1/team/invitations/{invite_id}", headers=admin_headers)
    assert revoke.status_code == 204

    pending = await client.get("/api/v1/team/invitations", headers=admin_headers)
    assert pending.json() == []

    accept = await client.post("/api/v1/team/accept-invite", json={
        "token": _invitation_token(invite), "password": "password123",
    })
    assert accept.status_code == 404


async def test_update_member_role_and_remove(client):
    admin_headers = await register_and_login(client, "team-role-a", "admin@team-role-a.example.com")

    invite = await client.post(
        "/api/v1/team/invite", headers=admin_headers,
        json={"email": "agent@team-role-a.example.com", "role": "agent"},
    )
    await client.post("/api/v1/team/accept-invite", json={
        "token": _invitation_token(invite), "password": "password123",
    })
    members = (await client.get("/api/v1/team/members", headers=admin_headers)).json()
    agent = next(m for m in members if m["email"] == "agent@team-role-a.example.com")

    promoted = await client.put(
        f"/api/v1/team/members/{agent['id']}/role", headers=admin_headers, json={"role": "manager"},
    )
    assert promoted.status_code == 200
    assert promoted.json()["role"] == "manager"

    removed = await client.delete(f"/api/v1/team/members/{agent['id']}", headers=admin_headers)
    assert removed.status_code == 204

    members_after = (await client.get("/api/v1/team/members", headers=admin_headers)).json()
    assert all(m["email"] != "agent@team-role-a.example.com" for m in members_after)


async def test_cannot_remove_self_or_last_admin(client):
    admin_headers = await register_and_login(client, "team-lastadmin-a", "admin@team-lastadmin-a.example.com")
    me = await client.get("/api/v1/auth/me", headers=admin_headers)
    admin_id = me.json()["id"]

    self_remove = await client.delete(f"/api/v1/team/members/{admin_id}", headers=admin_headers)
    assert self_remove.status_code == 400

    # Demoting the sole admin (even by itself) would leave the tenant admin-less.
    demote_last = await client.put(
        f"/api/v1/team/members/{admin_id}/role", headers=admin_headers, json={"role": "manager"},
    )
    assert demote_last.status_code == 400

    invite = await client.post(
        "/api/v1/team/invite", headers=admin_headers,
        json={"email": "second-admin@team-lastadmin-a.example.com", "role": "admin"},
    )
    accept = await client.post("/api/v1/team/accept-invite", json={
        "token": _invitation_token(invite), "password": "password123",
    })
    second_admin_headers = {"Authorization": f"Bearer {accept.json()['access_token']}"}

    # Now that a second admin exists, the *other* admin can demote the first.
    demote_ok = await client.put(
        f"/api/v1/team/members/{admin_id}/role", headers=second_admin_headers, json={"role": "manager"},
    )
    assert demote_ok.status_code == 200

    # The remaining sole admin still can't remove itself.
    second_admin_id = (await client.get("/api/v1/auth/me", headers=second_admin_headers)).json()["id"]
    self_remove_last = await client.delete(
        f"/api/v1/team/members/{second_admin_id}", headers=second_admin_headers,
    )
    assert self_remove_last.status_code == 400
