# Generated by Django 2.2.6 on 2021-05-14 09:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exam_application', '0003_history_bk_biz_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='history',
            name='bk_biz_id',
            field=models.BigIntegerField(null=True, verbose_name='业务id'),
        ),
    ]
