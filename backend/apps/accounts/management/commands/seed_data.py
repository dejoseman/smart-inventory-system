"""
Management command to seed the database with sample data.
"""

import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.products.models import Category, Product
from apps.customers.models import Customer
from apps.sales.services import create_sale

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample data for development.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create admin user
        admin, created = User.objects.get_or_create(
            email='admin@inventory.com',
            defaults={
                'full_name': 'Admin User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('  Created admin: admin@inventory.com / admin123'))

        # Create sales staff
        staff, created = User.objects.get_or_create(
            email='staff@inventory.com',
            defaults={
                'full_name': 'Sales Staff',
                'role': 'sales_staff',
            },
        )
        if created:
            staff.set_password('staff123')
            staff.save()
            self.stdout.write(self.style.SUCCESS('  Created staff: staff@inventory.com / staff123'))

        # Create categories
        categories_data = [
            {'name': 'Electronics', 'description': 'Electronic devices and gadgets'},
            {'name': 'Clothing', 'description': 'Apparel and fashion items'},
            {'name': 'Food & Beverages', 'description': 'Food items and drinks'},
            {'name': 'Office Supplies', 'description': 'Office and stationery items'},
            {'name': 'Home & Garden', 'description': 'Home décor and garden tools'},
            {'name': 'Health & Beauty', 'description': 'Health and beauty products'},
            {'name': 'Sports', 'description': 'Sports equipment and accessories'},
            {'name': 'Automotive', 'description': 'Car parts and accessories'},
        ]
        categories = {}
        for cat_data in categories_data:
            cat, _ = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']},
            )
            categories[cat.name] = cat

        self.stdout.write(self.style.SUCCESS(f'  Created {len(categories)} categories'))

        # Create products
        products_data = [
            {'name': 'Wireless Mouse', 'sku': 'ELEC-001', 'category': 'Electronics', 'price': 29.99, 'cost_price': 15.00, 'quantity': 150, 'threshold': 20},
            {'name': 'USB-C Hub', 'sku': 'ELEC-002', 'category': 'Electronics', 'price': 49.99, 'cost_price': 25.00, 'quantity': 80, 'threshold': 15},
            {'name': 'Mechanical Keyboard', 'sku': 'ELEC-003', 'category': 'Electronics', 'price': 89.99, 'cost_price': 45.00, 'quantity': 60, 'threshold': 10},
            {'name': 'Monitor Stand', 'sku': 'ELEC-004', 'category': 'Electronics', 'price': 39.99, 'cost_price': 18.00, 'quantity': 45, 'threshold': 10},
            {'name': 'Webcam HD', 'sku': 'ELEC-005', 'category': 'Electronics', 'price': 59.99, 'cost_price': 30.00, 'quantity': 5, 'threshold': 10},
            {'name': 'Cotton T-Shirt', 'sku': 'CLTH-001', 'category': 'Clothing', 'price': 19.99, 'cost_price': 8.00, 'quantity': 200, 'threshold': 30},
            {'name': 'Denim Jeans', 'sku': 'CLTH-002', 'category': 'Clothing', 'price': 49.99, 'cost_price': 22.00, 'quantity': 120, 'threshold': 20},
            {'name': 'Running Shoes', 'sku': 'CLTH-003', 'category': 'Clothing', 'price': 79.99, 'cost_price': 35.00, 'quantity': 75, 'threshold': 15},
            {'name': 'Organic Coffee Beans', 'sku': 'FOOD-001', 'category': 'Food & Beverages', 'price': 14.99, 'cost_price': 7.50, 'quantity': 300, 'threshold': 50},
            {'name': 'Green Tea Box', 'sku': 'FOOD-002', 'category': 'Food & Beverages', 'price': 9.99, 'cost_price': 4.00, 'quantity': 250, 'threshold': 40},
            {'name': 'Protein Bar Pack', 'sku': 'FOOD-003', 'category': 'Food & Beverages', 'price': 24.99, 'cost_price': 12.00, 'quantity': 180, 'threshold': 25},
            {'name': 'Notebook A5', 'sku': 'OFFC-001', 'category': 'Office Supplies', 'price': 5.99, 'cost_price': 2.00, 'quantity': 500, 'threshold': 100},
            {'name': 'Pen Set', 'sku': 'OFFC-002', 'category': 'Office Supplies', 'price': 12.99, 'cost_price': 5.00, 'quantity': 400, 'threshold': 80},
            {'name': 'Desk Organizer', 'sku': 'OFFC-003', 'category': 'Office Supplies', 'price': 29.99, 'cost_price': 13.00, 'quantity': 3, 'threshold': 10},
            {'name': 'Table Lamp', 'sku': 'HOME-001', 'category': 'Home & Garden', 'price': 34.99, 'cost_price': 16.00, 'quantity': 55, 'threshold': 10},
            {'name': 'Plant Pot Set', 'sku': 'HOME-002', 'category': 'Home & Garden', 'price': 22.99, 'cost_price': 10.00, 'quantity': 90, 'threshold': 15},
            {'name': 'Vitamin C Supplements', 'sku': 'HLTH-001', 'category': 'Health & Beauty', 'price': 16.99, 'cost_price': 8.00, 'quantity': 150, 'threshold': 20},
            {'name': 'Face Moisturizer', 'sku': 'HLTH-002', 'category': 'Health & Beauty', 'price': 24.99, 'cost_price': 11.00, 'quantity': 100, 'threshold': 15},
            {'name': 'Yoga Mat', 'sku': 'SPRT-001', 'category': 'Sports', 'price': 29.99, 'cost_price': 12.00, 'quantity': 70, 'threshold': 10},
            {'name': 'Water Bottle', 'sku': 'SPRT-002', 'category': 'Sports', 'price': 14.99, 'cost_price': 5.00, 'quantity': 200, 'threshold': 30},
        ]

        products = []
        for p in products_data:
            product, _ = Product.objects.get_or_create(
                sku=p['sku'],
                defaults={
                    'name': p['name'],
                    'category': categories[p['category']],
                    'price': Decimal(str(p['price'])),
                    'cost_price': Decimal(str(p['cost_price'])),
                    'quantity': p['quantity'],
                    'low_stock_threshold': p['threshold'],
                    'description': f"High-quality {p['name'].lower()} for everyday use.",
                },
            )
            products.append(product)

        self.stdout.write(self.style.SUCCESS(f'  Created {len(products)} products'))

        # Create customers
        customers_data = [
            {'name': 'John Smith', 'phone': '+1-555-0101', 'email': 'john@example.com', 'address': '123 Main St, New York'},
            {'name': 'Sarah Johnson', 'phone': '+1-555-0102', 'email': 'sarah@example.com', 'address': '456 Oak Ave, Chicago'},
            {'name': 'Michael Brown', 'phone': '+1-555-0103', 'email': 'michael@example.com', 'address': '789 Pine Rd, Houston'},
            {'name': 'Emily Davis', 'phone': '+1-555-0104', 'email': 'emily@example.com', 'address': '321 Elm St, Phoenix'},
            {'name': 'David Wilson', 'phone': '+1-555-0105', 'email': 'david@example.com', 'address': '654 Cedar Ln, Dallas'},
            {'name': 'Lisa Anderson', 'phone': '+1-555-0106', 'email': 'lisa@example.com', 'address': '987 Birch Dr, Miami'},
            {'name': 'James Taylor', 'phone': '+1-555-0107', 'email': 'james@example.com', 'address': '147 Maple Way, Seattle'},
            {'name': 'Jessica Martinez', 'phone': '+1-555-0108', 'email': 'jessica@example.com', 'address': '258 Walnut Blvd, Denver'},
        ]
        customers = []
        for c in customers_data:
            customer, _ = Customer.objects.get_or_create(
                email=c['email'],
                defaults={
                    'name': c['name'],
                    'phone': c['phone'],
                    'address': c['address'],
                },
            )
            customers.append(customer)

        self.stdout.write(self.style.SUCCESS(f'  Created {len(customers)} customers'))

        # Create sample sales
        payment_methods = ['cash', 'card', 'transfer']
        sale_count = 0

        for i in range(15):
            try:
                num_items = random.randint(1, 4)
                selected_products = random.sample(products, min(num_items, len(products)))
                items = [
                    {
                        'product_id': str(p.id),
                        'quantity': random.randint(1, 3),
                    }
                    for p in selected_products
                ]
                customer = random.choice(customers) if random.random() > 0.3 else None
                sale = create_sale(
                    staff=random.choice([admin, staff]),
                    items=items,
                    customer=customer,
                    payment_method=random.choice(payment_methods),
                    discount=Decimal(str(random.choice([0, 0, 0, 5, 10, 15]))),
                )
                sale_count += 1
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skipped sale {i+1}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'  Created {sale_count} sales'))
        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('\nLogin credentials:'))
        self.stdout.write(self.style.SUCCESS('  Admin: admin@inventory.com / admin123'))
        self.stdout.write(self.style.SUCCESS('  Staff: staff@inventory.com / staff123'))
