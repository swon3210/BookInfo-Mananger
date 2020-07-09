module.exports = function (app, conn) {

  /* ---------------------------------------------------------- MANAGE */

  // 테이블 리스트 관리 페이지
  app.get(['/', '/manage/table_list'], function (req, res) {
    let tables = [];
    let show_all_table_sql = 'SHOW TABLES';
    conn.query(show_all_table_sql, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        for (let result of results) {
          tables.push(result['Tables_in_bookdatabase']);
        }
        res.render('index', {
          page: 'manage/table_list',
          tables: tables,
        });
      }
    });
  });

  // 테이블 관리 페이지
  app.get('/manage/table/:table_name', function (req, res) {
    let table_name = req.params.table_name;
    let select_all_sql = `SELECT * FROM \`${table_name}\`;`;
    let rows;
    conn.query(select_all_sql, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        rows = results;
      }
      res.render('index', {
        page: 'manage/table',
        table_name: table_name,
        rows: rows,
      });
    });
  });

  /* ---------------------------------------------------------- INPUT */

  // 테이블 생성 페이지
  app.get('/input/table', function (req, res) {
    res.render('index', {
      page: 'input/table',
    });
  });

  // 테이블 생성 작업 -- 생성과 동시에 id 값만이 존재하는 더미 행이 추가됨
  app.post('/input/table', function (req, res) {
    let table_name = req.body.table_name;
    let create_table_sql = `
      CREATE TABLE \`${table_name}\` (
        id INT AUTO_INCREMENT,
        PRIMARY KEY(id)
      );
    `;
    let insert_dummy_sql = `INSERT INTO \`${table_name}\` VALUES ();`;
    conn.query(create_table_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect('/input/table');
      } else {
        conn.query(insert_dummy_sql, function () {
          res.redirect(`/manage/table/${table_name}`);
        });
      }
    });
  });

  // 테이블 행 생성 페이지
  app.get('/input/row/:table_name', function (req, res) {
    let columns = [];
    let table_name = req.params.table_name;
    let show_columns_sql = `
      SHOW COLUMNS FROM \`${table_name}\`;
    `;
    conn.query(show_columns_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect(`/manage/table/${table_name}`);
      } else {
        for (let result of results) {
          if (result['Field'] !== 'id') {
            columns.push(result['Field']);
          }
        }
        res.render('index', {
          page: 'input/row',
          table_name: table_name,
          columns: columns,
        });
      }
    });
  });

  // 테이블 행 생성 작업
  app.post('/input/row/:table_name', function (req, res) {
    let table_name = req.params.table_name;
    let body = req.body;
    let columns = [];
    let values = [];
    for (let i in body) {
      columns.push(i);
      values.push(body[i]);
    }
    columns = columns.map((column) => `\`${column}\``);
    values = values.map((value) => `"${value}"`);
    let create_row_sql = `
      INSERT INTO \`${table_name}\` (${columns.join(',')}) 
      VALUES (${values.join(',')});`;
    conn.query(create_row_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect(`/manage/table/${table_name}`);
      }
      res.redirect(`/manage/table/${table_name}`);
    });
  });

  // 테이블 열 생성 페이지
  app.get('/input/column/:table_name', function (req, res) {
    let table_name = req.params.table_name;
    res.render('index', {
      page: 'input/column',
      table_name: table_name,
    });
  });

  // 테이블 열 생성 작업
  app.post('/input/column/:table_name', function (req, res) {
    let table_name = req.params.table_name;
    let column_name = req.body.column_name;
    let column_type = req.body.column_type;
    let add_column_sql = `
      ALTER TABLE \`${table_name}\`
      ADD COLUMN \`${column_name}\` ${column_type};
    `;
    conn.query(add_column_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect(`/input/column/${table_name}`);
      } else {
        res.redirect(`/manage/table/${table_name}`);
      }
    });
  });

  /* ---------------------------------------------------------- EDIT */

  // 테이블 수정 페이지
  app.get('/edit/table/:table_name', function (req, res) {
    let table_name = req.params.table_name;
    res.render('index', {
      page: 'edit/table',
      table_name: table_name,
    });
  });

  // 테이블 수정 작업
  app.post('/edit/table/:table_name', function (req, res) {
    let table_name = req.params.table_name;
    let updated_table_name = req.body.table_name;
    let update_table_sql = `
      ALTER TABLE \`${table_name}\`
      RENAME \`${updated_table_name}\`;
    `;
    conn.query(update_table_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect('/manage/table_list');
      }
      res.redirect('/manage/table_list');
    });
  });

  // 테이블 행 수정 페이지
  app.get('/edit/row/:table_name/:id', function (req, res) {
    let table_name = req.params.table_name;
    let id = req.params.id;
    let row;
    let get_row_sql = `
      SELECT * FROM \`${table_name}\` WHERE id LIKE ${id};
    `;
    conn.query(get_row_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect(`/manage/table/${table_name}`);
      } else {
        row = results[0];
        delete row.id;
        res.render('index', {
          page: 'edit/row',
          table_name: table_name,
          id: id,
          row: row,
        });
      }
    });
  });

  // 테이블 행 수정 작업
  app.post('/edit/row/:table_name/:id', function (req, res) {
    let body = req.body;
    let table_name = req.params.table_name;
    let id = req.params.id;
    let column_value_pairs = [];

    // 주의 : 텍스트 내용에 '', "", `` 가 없도록 할 것.
    for (let i in body) {
      let column_value = `\`${i}\` = "${body[i]}"`;
      column_value_pairs.push(column_value);
    }
    let update_row_sql = `
      UPDATE \`${table_name}\`
      SET ${column_value_pairs.join(',')}
      WHERE id LIKE ${id};
    `;
    conn.query(update_row_sql, function (err, results) {
      if (err) {
        console.log(err);
      }
      res.redirect(`/manage/table/${table_name}`);
    });
  });

  // 테이블 열 수정 페이지
  app.get('/edit/column/:table_name/:column_name', function (req, res) {
    let table_name = req.params.table_name;
    let column_name = req.params.column_name;

    res.render('index', {
      page: 'edit/column',
      table_name: table_name,
      column_name: column_name,
    });
  });

  // 테이블 열 수정 작업
  app.post('/edit/column/:table_name/:column_name', function (req, res) {
    let table_name = req.params.table_name;
    let column_name = req.params.column_name;
    let updated_column_name = req.body.column_name;
    let updated_column_type = req.body.column_type;
    let update_column_sql = `
      ALTER TABLE \`${table_name}\` 
      CHANGE \`${column_name}\` \`${updated_column_name}\` ${updated_column_type};
    `;

    conn.query(update_column_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect(`/edit/column/${table_name}/${column_name}`);
      } else {
        res.redirect(`/manage/table/${table_name}`);
      }
    });
  });

  /* ---------------------------------------------------------- DELETE */

  // 테이블 삭제 작업
  app.get('/delete/table/:table_name', function (req, res) {
    let table_name = req.params.table_name;
    let table_delete_sql = `
      DROP TABLE \`${table_name}\`;
    `;
    conn.query(table_delete_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect('/manage/table_list');
      } else {
        res.redirect('/manage/table_list');
      }
    });
  });

  // 테이블 행 삭제 작업
  app.get('/delete/row/:table_name/:id', function (req, res) {
    let table_name = req.params.table_name;
    let id = req.params.id;
    let delete_row_sql = `
      DELETE FROM \`${table_name}\`
      WHERE id LIKE ${id}
    `;
    conn.query(delete_row_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect(`/manage/table/${table_name}`);
      } else {
        res.redirect(`/manage/table/${table_name}`);
      }
    });
  });

  // 테이블 열 삭제 작업
  app.get('/delete/column/:table_name/:column_name', function (req, res) {
    let table_name = req.params.table_name;
    let column_name = req.params.column_name;
    let remove_column_sql = `
      ALTER TABLE \`${table_name}\` DROP \`${column_name}\`;
    `;
    conn.query(remove_column_sql, function (err, results) {
      if (err) {
        console.log(err);
        res.redirect(`/manage/table/${table_name}`);
      } else {
        res.redirect(`/manage/table/${table_name}`);
      }
    });
  });

  /* ---------------------------------------------------------- INQUIRE */

  // 조회 페이지 -------------- 여기서부터는 본인이 직접 
  app.get('/inquire/book', function (req, res) {


    res.render('index', {
      page: 'inquire/book',
      page_name: '페이지 이름',
    });
  });

  /* ---------------------------------------------------------- SEARCH */

  // 검색 페이지
  app.get('/search', function (req, res) {
    res.render('index', {
      page: 'search/search',
      page_name: '페이지 이름',
    });
  });
};
