const fs = plus.sqlite;
const path = "_doc/mydiary.db";
const dbName = "mydiary";

/************************************************ */

/**
 * 打开数据库
 */
const openDB = () => { // 打开数据库
	return new Promise((resolve, reject) => {
		if (!isOpenDatabase()) {
			fs.openDatabase({
				name: dbName,
				path: path,
				success: function (res) {
					console.log('openDatabase success!', res);
					resolve(res);
				},
				fail: function (e) {
					console.log('openDatabase failed: ' + JSON.stringify(e));
					reject(e);
				}
			});
		} else {
			console.log('Database already open!');
			resolve({
				isOk: true,
				msg: 'Database already open!'
			});
		}
		// resolve(e); //成功回调
		// reject(e); //回失败调
	});

}
/**
 * 检查数据库是否打开
 */
const isOpenDatabase = function () { // 检查数据库是否打开
	var options = {
		name: dbName,
		path: path,
		success: function (res) {
			console.log('openDatabase success!');
		},
		fail: function (e) {
			console.log('openDatabase failed: ', e);
		}
	}
	return fs.isOpenDatabase(options);
}
/**
 * 关闭数据库
 */
const closeDB = function () {
	return new Promise((resolve, reject) => {
		if (isOpenDatabase()) {
			var options = {
				name: dbName,
				success: function (res) {
					console.log('closeDatabase success!', res);
					resolve(res);
				},
				fail: function (e) {
					console.log('closeDatabase failed: ' + JSON.stringify(e));
					reject(e);
				}
			}
			fs.closeDatabase(options);
		} else {
			resolve({
				isOk: true,
				msg: '已关闭'
			});
		}
	});

}
/**
 * 事务状态控制
 * @param {Object} operation  需要执行的事务操作 begin（开始事务）、commit（提交）、rollback（回滚）。
 */
const transaction = function (operation) {
	return new Promise((resolve, reject) => {
		var options = {
			name: dbName,
			operation: operation,
			success(e) {
				resolve(e); // 成功回调
			},
			fail(e) {
				reject(e); // 失败回调
			}
		}
		fs.transaction(options);
	});
}
/**
 * 事务启动
 */
const transactionBegin = function () { //开启事务
	return transaction("begin");
}
/**
 * 事务提交
 */
const transactionCommit = function () { //提交事务
	return transaction("commit");
}
/**
 * 事务回滚
 */
const transactionRollback = function () { //回滚事务
	return transaction("rollback");
}
/**
 * 执行sql
 * @param {String|Array} sql 语句或者语句组，支持批量，但是每次批量不要超过500，超过500的自己拆分多次
 */
const _exec = function (sql) {
	return new Promise((resolve, reject) => {
		fs.executeSql({
			name: dbName,
			sql: sql,
			success(e) {
				resolve(e); // 成功回调
			},
			fail(e) {
				console.error(e)
				reject(e); // 失败回调
			}
		})
	});
}

/**
 * 执行sql语句
 * @param {String|Array} sql 语句或者语句组，支持批量，但是每次批量不要超过500，超过500的自己拆分多次
 * @param {Bool} useTran 是否使用事务
 */
const executeSQL = async function (sql, useTran) { //执行语句
	await openDB()
	if (useTran) {
		transactionBegin().then(() => {
			return _exec(sql);
		}).then((sqldata) => {
			return transactionCommit();
		}).catch((err) => {
			return transactionRollback();
		});
	} else {
		return _exec(sql);
	}
	// closeDB();
}



/**
 * 执行查寻sql语句
 * @param {String} sql
 */
const selectSQL = async function (sql) {
	await openDB()
	return new Promise((resolve, reject) => {
		fs.selectSql({
			name: dbName,
			sql: sql,
			success: function (data) {
				resolve(data);
				// closeDB();
			},
			fail: function (e) {
				reject(e); //回失败调
				// closeDB();
			}
		});
	});
}

/**
 * 创建表
 * @param {String} tbname 表名称
 * @param {String} tbsql 表列slq
 */
const createTbSql = function (tbname, tbsql) { //
	if (tbsql != "") {
		tbsql = "create table if not exists " + tbname + " (" + tbsql + ")"
		return executeSQL(tbsql, false);
	}
}
/**
 * 删除表
 * @param {String} 表名
 */
const dropTable = function (tbname) { //删除表
	var sql = 'drop table if exists  ' + tbname;
	return executeSQL(sql, false);
}
/**
 * 清空表
 * @param {String} 表名
 */
const clearTable = function (tbname) { //
	var sql = 'DELETE FROM ' + tbname;
	return executeSQL(sql, false);
}

export {
	openDB,
	closeDB,
	executeSQL,
	selectSQL,
	createTbSql,
	dropTable,
	clearTable
}
