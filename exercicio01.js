/*
No objeto "database", crie uma função chamada "createTable", que recebe o comando por parâmetro.
Mova o código responsável por criar a tabela para dentro do método "createTable".
Crie uma função chamada "execute", invocando dinamicamente a função "createTable"
*/

const database = {
    tables: {},
    createTable(script) {
        const regCreateTable = /^\s*create\s+table\s+(\w+)\s*\(([\w\s,]+)\)/;
        const result = regCreateTable.exec(script);
        const tableName = result[1];
        const columns = result[2].split(',');
        this.tables = {
            [tableName] : {
                "columns" : {},
                "data" : []
            }
        }
        columns.forEach(c => {
            let column = c.trim().split(' ');
            let nome = column[0];
            let tipo = column[1];
            this.tables[tableName].columns[nome] = tipo;
        });
    },
    execute(script) {
        if (script.startsWith("create table")) {
            this.createTable(script);
        }
    }
};

database.execute( `create table author (
    id number,
    name string,
    age number,
    city string,
    state string, 
    country string
)`);

console.log(JSON.stringify(database, undefined, "   "));
