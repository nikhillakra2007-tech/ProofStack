"""
Tests for Gate G3: Identity Preservation Guard
Ensures speed never beats identity: dropping user_id, tenant_id, or auth checks is strictly rejected.
"""

from proofstack.gates.g3_identity import G3IdentityGate


def test_dropped_user_parameter_rejected():
    baseline_code = """
def fetch_user_orders(user_id: str, tenant_id: str):
    return db.query(Order).filter(Order.tenant_id == tenant_id, Order.user_id == user_id).all()
"""
    # Bad AI patch that removed user_id for faster caching
    candidate_code = """
def fetch_user_orders(tenant_id: str):
    return db.query(Order).filter(Order.tenant_id == tenant_id).all()
"""
    diff_text = """
--- a/orders.py
+++ b/orders.py
@@ -1,2 +1,2 @@
-def fetch_user_orders(user_id: str, tenant_id: str):
+def fetch_user_orders(tenant_id: str):
"""
    passed, violations = G3IdentityGate.inspect_diff_and_ast(baseline_code, candidate_code, diff_text)
    assert passed is False
    assert any("user_id" in v for v in violations)


def test_dropped_auth_decorator_rejected():
    baseline_code = """
@login_required
def update_profile(user_id: str):
    return service.update(user_id)
"""
    candidate_code = """
def update_profile(user_id: str):
    return service.update(user_id)
"""
    diff_text = """
--- a/profile.py
+++ b/profile.py
@@ -1,2 +1,1 @@
-@login_required
 def update_profile(user_id: str):
"""
    passed, violations = G3IdentityGate.inspect_diff_and_ast(baseline_code, candidate_code, diff_text)
    assert passed is False
    assert any("login_required" in v for v in violations)


def test_intact_identity_passes():
    baseline_code = """
def fetch_user_orders(user_id: str, tenant_id: str):
    return db.query(Order).filter(Order.tenant_id == tenant_id, Order.user_id == user_id).all()
"""
    candidate_code = """
def fetch_user_orders(user_id: str, tenant_id: str):
    # Optimized batch index lookup preserving identity
    return db.query(Order).options(selectinload(Order.items)).filter(Order.tenant_id == tenant_id, Order.user_id == user_id).all()
"""
    diff_text = """
--- a/orders.py
+++ b/orders.py
@@ -2,2 +2,3 @@
-    return db.query(Order).filter(Order.tenant_id == tenant_id, Order.user_id == user_id).all()
+    return db.query(Order).options(selectinload(Order.items)).filter(Order.tenant_id == tenant_id, Order.user_id == user_id).all()
"""
    passed, violations = G3IdentityGate.inspect_diff_and_ast(baseline_code, candidate_code, diff_text)
    assert passed is True
    assert len(violations) == 0
