import types


def setup(balance):
    return types.SimpleNamespace(balance=balance)


def withdraw(ctx, amount):
    if ctx.balance >= amount:                              # check
        ctx.balance -= amount                              # act: not atomic with the check
        return True
    return False


def balance(ctx):
    return ctx.balance
