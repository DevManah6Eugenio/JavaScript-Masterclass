const DatabaseError = function(statement, message) {
    this.statement = statement;
    this.message = message;
}

const database = {
    tables: {},

    createTable(statement) {
        const regCreateTable = /^\s*create\s+table\s+(\w+)\s*\(([\w\s,]+)\)/;
        const result = regCreateTable.exec(statement);
        const [, tableName, columns] = result;
        this.tables = {
            [tableName] : {
                "columns" : {},
                "data" : []
            }
        }
        columns.split(',').forEach(c => {
            let column = c.trim().split(' ');
            let [nome, tipo] = column;
            this.tables[tableName].columns[nome] = tipo;
        });
    },

    insert(statement) {
        const regInsert = /^\s*insert\s+into\s+(\w+)\s*\(([\w\s,]+)\)\svalues\s\(([\w\s,]+)\)/;
        const result = regInsert.exec(statement);
        let [, tableName, columns, values] = result;
        columns = columns.split(',').map(c => c.trim());
        values = values.split(',').map(v => v.trim());
        row = {};
        columns.forEach((_, index) => 
            row[columns[index]] = values[index]
        );
        this.tables[tableName].data.push(row);
    },

    select(statement) {
        const regSelect = /^\s*select\s+(.+)\s+from\s([a-z]+)(?: where (.+))?/;
        const result = regSelect.exec(statement);
        let [, columns, tableName, whereClause] = result;
        columns = columns.split(',').map(c => c.trim());
        let rows = this.tables[tableName].data;
        if (whereClause) {
            let [columnWhere, valueWhere] = whereClause.split('=').map(w => w.trim()); 
            rows = rows.filter(row => row[columnWhere] === valueWhere);
        }
        rows = rows.map(row => { 
            let selectedRow = {};
            columns.forEach(column => {
                selectedRow[column] = row[column];
            });
            return selectedRow;
        });
        return rows;
    },

    delete(statement) {
        const regDelete = /^\s*delete\s+from\s([a-z]+)(?: where\s+(.+))?/;
        const result = regDelete.exec(statement);
        let [, tableName, whereClause] = result;
        if (whereClause) {
            let [columnWhere, valueWhere] = whereClause.split('=').map(w => w.trim());
            this.tables[tableName].data = this.tables[tableName].data.filter(row => !(row[columnWhere] === valueWhere));
        } else {
            this.tables[tableName].data = [];
        }
    },

    execute(statement) {
        if (statement.startsWith("create table")) {
            return this.createTable(statement);
        } else if (statement.startsWith("insert into")) {
            return this.insert(statement);
        } else if (statement.startsWith("select")) {
            return this.select(statement);
        } else if (statement.startsWith("delete from")) {
            return this.delete(statement);
        } 
        const message = `Syntax error: '${statement}'`
        throw new DatabaseError(statement, message);
    }
};

try {
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    database.execute("delete from author where id = 2");
    console.log(database.execute("select name, age from author"));
    database.execute("delete from author");
    console.log(database.execute("select name, age from author"));
    //console.log(JSON.stringify(database, undefined, "   "));
} catch (error) {
    console.log(error.message);
}
