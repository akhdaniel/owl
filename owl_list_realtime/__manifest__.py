# -*- coding: utf-8 -*-
{
    'name': "Kanban Realtime",

    'summary': "Short (1 phrase/line) summary of the module's purpose",

    'description': """
Long description of module's purpose
    """,

    'author': "My Company",
    'website': "https://www.yourcompany.com",

    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','mrp'],

    # always loaded
    'data': [
        'views/views.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        # 'demo/demo.xml',
    ],

    'assets': {
        'web.assets_backend': [
            'owl_kanban_realtime/static/lib/*',
            'owl_kanban_realtime/static/src/js/**/*',
        ],
    },
}

