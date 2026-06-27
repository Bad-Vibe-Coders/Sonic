"""Catalog integrity tests."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "scripts"))
import catalog as C


def test_all_ids_unique():
    ids = C.all_ids()
    assert len(ids) == len(set(ids))


def test_every_id_has_section():
    for did in C.all_ids():
        assert C.section_of(did) is not None


def test_every_id_has_name():
    for did in C.all_ids():
        assert C.slug_name(did)


def test_xrefs_resolve():
    valid = set(C.all_ids())
    for did in C.all_ids():
        for x in C.meta(did)["xref"]:
            assert x in valid, f"{did} references unknown {x}"


def test_count():
    assert len(C.all_ids()) == 59
