P01 = {"attacks": [{"unit": "a", "suffix": "!"}, {"unit": "a", "suffix": "\x00"}],
       "reference": "fixtures/p01/red.py::validate",
       "seeds": ["alice@example.com", "@example.com", "", "alice@example.org", "a1@example.com"]}
case("P01", "p01_redos", "red", True, *tgt("fixtures/p01/red.py", "validate", P01))
case("P01", "p01_redos", "green", False, *tgt("fixtures/p01/green.py", "validate", P01))
case("P01", "p01_redos", "wrong_rewrite", True, *tgt("fixtures/p01/wrong_rewrite.py", "validate", P01))
case("P02", "p02_nplus1_sqli", "red(n+1)", True, *tgt("fixtures/p02/red.py", "fetch"))
case("P02", "p02_nplus1_sqli", "trap(sqli)", True, *tgt("fixtures/p02/trap.py", "fetch"))
case("P02", "p02_nplus1_sqli", "green", False, *tgt("fixtures/p02/green.py", "fetch"))
case("P03", "p03_idor_cache", "red", True, *tgt("fixtures/p03/red.py"))
case("P03", "p03_idor_cache", "green", False, *tgt("fixtures/p03/green.py"))
case("P04", "p04_quadratic", "red", True, *tgt("fixtures/p04/red.py", "has_duplicates"))
case("P04", "p04_quadratic", "green", False, *tgt("fixtures/p04/green.py", "has_duplicates"))
case("P05", "p05_async_block", "red", True, *tgt("fixtures/p05/red.py", "handler"))
case("P05", "p05_async_block", "green_thread", False, *tgt("fixtures/p05/green_thread.py", "handler"))
case("P05", "p05_async_block", "green_async", False, *tgt("fixtures/p05/green_async.py", "handler"))
case("P06", "p06_memory_growth", "red", True, *tgt("fixtures/p06/red.py", "lookup"))
case("P06", "p06_memory_growth", "green", False, *tgt("fixtures/p06/green.py", "lookup"))
case("P07", "p07_toctou", "red", True, *tgt("fixtures/p07/red.py"))
case("P07", "p07_toctou", "green", False, *tgt("fixtures/p07/green.py"))
case("P08", "p08_ssrf", "red", True, *tgt("fixtures/p08/red.py", "fetch_url"))
case("P08", "p08_ssrf", "naive(rebind)", True, *tgt("fixtures/p08/naive.py", "fetch_url"))
case("P08", "p08_ssrf", "green", False, *tgt("fixtures/p08/green.py", "fetch_url"))
CH = {"channels": [{"fn": "load_config", "kind": "pickle"}, {"fn": "load_yaml", "kind": "yaml"},
                   {"fn": "run_tool", "kind": "shell"}, {"fn": "calc", "kind": "eval"}]}
case("P09", "p09_deserialization", "red", True, *tgt("fixtures/p09/red.py", "", CH))
case("P09", "p09_deserialization", "green", False, *tgt("fixtures/p09/green.py", "", CH))
case("P10", "p10_timeouts_retries", "red", True, *tgt("fixtures/p10/red.py", "call_service"))
case("P10", "p10_timeouts_retries", "green", False, *tgt("fixtures/p10/green.py", "call_service"))
case("P11", "p11_jwt_tokens", "red", True, *tgt("fixtures/p11/red.py"))
case("P11", "p11_jwt_tokens", "green", False, *tgt("fixtures/p11/green.py"))
case("P12", "p12_path_traversal", "red", True, *tgt("fixtures/p12/red.py"))
case("P12", "p12_path_traversal", "green", False, *tgt("fixtures/p12/green.py"))
P14 = {"inject": "dep.fetch", "call": {"fn": "process", "args": ["k1"]},
       "defaults": {"fn": "collect", "args_a": ["a"], "args_b": ["b"]}}
case("P14", "p14_silent_corruption", "red", True, *tgt("fixtures/p14/red.py", "", P14))
case("P14", "p14_silent_corruption", "green", False, *tgt("fixtures/p14/green.py", "", P14))
case("P15", "p15_pool_idempotency", "red", True, *tgt("fixtures/p15/red.py"))
case("P15", "p15_pool_idempotency", "green", False, *tgt("fixtures/p15/green.py"))
case("P13", "p13_supply_chain", "red", True, "--root", "fixtures/p13/red", "--files", "app.py", "requirements.txt")
case("P13", "p13_supply_chain", "green", False, "--root", "fixtures/p13/green", "--files", "app.py", "requirements.txt")
UT = '["python3","-m","unittest","-q"]'
case("P16", "p16_mutation", "weak_tests", True, "--src", "shop.py", "--cwd", "fixtures/p16/weak", "--test-cmd", UT)
case("P16", "p16_mutation", "strong_tests", False, "--src", "shop.py", "--cwd", "fixtures/p16/strong", "--test-cmd", UT)
case("P17", "p17_deadlock", "red", True, *tgt("fixtures/p17/red.py"))
case("P17", "p17_deadlock", "green", False, *tgt("fixtures/p17/green.py"))
P18 = ["--old", "fixtures/p18/old.json"]
case("P18", "p18_contract_drift", "breaking", True, *P18, "--new", "fixtures/p18/new_breaking.json", "--mode", "FULL",
     "--examples-old", "fixtures/p18/examples_old", "--examples-new", "fixtures/p18/examples_new_bad")
case("P18", "p18_contract_drift", "compatible", False, *P18, "--new", "fixtures/p18/new_compatible.json", "--mode", "FULL",
     "--examples-old", "fixtures/p18/examples_old", "--examples-new", "fixtures/p18/examples_new_ok")
case("P19", "p19_float_money", "red", True, *tgt("fixtures/p19/red.py"))
case("P19", "p19_float_money", "green", False, *tgt("fixtures/p19/green.py"))
