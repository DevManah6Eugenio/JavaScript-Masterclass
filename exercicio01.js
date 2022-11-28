/*
Extraia o nome da tabela e armazene em uma variável chamada "tableName".
Extraia as colunas da tabela e armazene em uma variável chamada "columns".
Manipule a variável "columns", separando cada coluna com seu respectivo tipo, em uma string separada.
*/

let script = 'create table author (id number, name string, age number, city string, state string, country string)';
let regCreateTable = /^create\stable\s(\w+)\s\((.+)\)/;
let result = regCreateTable.exec(script);
let tableName = result[1];
let columns = result[2].split(',');
columns = columns.map((each) => each.trim());
console.log(`
    tableName: ${tableName} 
    columns: ${columns}
`);