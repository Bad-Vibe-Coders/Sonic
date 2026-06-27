"""Smoke tests over generated artifacts."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent


def test_readme_exists():
    assert (ROOT / "README.md").exists()


def test_mkdocs_exists():
    assert (ROOT / "mkdocs.yml").exists()


def test_index_exists():
    assert (ROOT / "docs" / "architecture_index.md").exists()
