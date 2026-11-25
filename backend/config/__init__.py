# Conector MySQL en Python puro (evita compilar mysqlclient en macOS).
try:
    import pymysql

    pymysql.version_info = (2, 2, 1, 'final', 0)
    pymysql.install_as_MySQLdb()
except ImportError:  # si se instaló mysqlclient, Django lo usa directamente
    pass
