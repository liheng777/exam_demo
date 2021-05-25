from django.db import transaction

from exam_application import models


# 事务装饰器
@transaction.atomic()
def add():
    """
    往history表中插入一条数据
    """
    # todo 方法1
    history = models.History()
    history.username = ''
    history.bk_biz_id = 1
    history.save()

    # todo 方法2
    models.History.objects.create(username='', bk_biz_id=1)


def bulk_add():
    """
    批量新增
    """
    history_list = []
    for i in range(1, 5):
        history = models.History()
        history.username = ''
        history.bk_biz_id = i
        history_list.append(history)
    models.History.objects.bulk_create(history_list)


def delete():
    """
    删除数据
    """
    # todo 根据条件删除
    models.History.objects.filter(id=1).delete()

    # todo 全部删除
    models.History.objects.all.delete()


def update():
    """
    更新数据
    """
    # todo 方法1
    models.History.objects.filter(id=1).update(bk_biz_id=1)

    # todo 方法2
    history = models.History.objects.filter(id=1)
    history.bk_biz_id = 1
    history.save()


def select():
    """
    查询数据
    """
    models.History.objects.get(id=1)  # 查询一条数据，多条或者没有查询到则报错

    models.History.objects.filter(id=1)  # 可以查询多条
    models.History.objects.all()  # 查询全部数据
