import threading
import types


def setup(balance):
    return types.SimpleNamespace(balance=balance, lock=threading.Lock())


def withdraw(ctx, amount):
    with ctx.lock:                                         # DB equivalent: UPDATE ... WHERE balance >= :amt
        if ctx.balance >= amount:
            ctx.balance -= amount
            return True
        return False


def balance(ctx):
    return ctx.balance
