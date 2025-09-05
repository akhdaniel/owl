
def domain_to_sql( domain, model):
    """
    Convert an Odoo domain into an SQL WHERE clause.
    :param domain: List of domain conditions
    :param model: Odoo model (to validate fields)
    :return: SQL WHERE clause as a string and parameters
    """
    where_clauses = []
    params = []

    if not domain:
        return '', ()

    model_name = model._name 
    alias = model_name.replace('.','_')

    where_clauses = []
    params = []

    for condition in domain:
        if len(condition) == 3:
            field, operator, value = condition

            # Validate the field exists in the model
            if field not in model._fields:
                return "",[]

            
            # Map Odoo operators to SQL operators
            sql_operator = {
                '=': '=',
                '!=': '!=',
                '>': '>',
                '<': '<',
                '>=': '>=',
                '<=': '<=',
                'ilike': 'ILIKE',
                'like': 'LIKE',
                'in': 'IN',
                'not in': 'NOT IN',
            }.get(operator)

            if not sql_operator:
                raise ValueError(f"Unsupported operator: {operator}")

            # Handle special cases for IN and NOT IN
            if operator in ['in', 'not in']:
                placeholders = ', '.join(['%s'] * len(value))
                where_clauses.append(f"{alias}.{field} {sql_operator} ({placeholders})")
                params.extend(value)
            elif operator in ['like','ilike']:
                where_clauses.append(f"{alias}.{field} {sql_operator} %s")
                params.append(f"%{value}%")
            else:
                where_clauses.append(f"{alias}.{field} {sql_operator} %s")
                params.append(value)

    # Combine all conditions with AND
    where_clause = " AND ".join(where_clauses)
    if where_clause.strip():
        where_clause = f"AND {where_clause}"
    else:
        where_clause = ""

    return where_clause, params


def process_domain(domain, model):
    for condition in domain:
        # if isinstance(condition[2], str) and ',' in condition[2]:
        #     # Split the value by commas and create new conditions
        #     split_values = [value.strip() for value in condition[2].split(',')]
        #     new_conditions = [[condition[0], condition[1], value] for value in split_values]
        #     domain.extend(new_conditions)
        #     domain.remove(condition)
        #     continue
        if condition[0] not in model._fields:
            # If the field is not valid, log a warning
            print(f"Field {condition[0]} not found in model {model._name}.")
            # If the field is not valid, return an empty list
            return []
        
    # If no "keyword" key and all fields are valid, return the original domain
    return domain