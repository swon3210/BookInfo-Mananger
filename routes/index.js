module.exports = function (app, conn) {
  // id 같은 경우는 빼자. 그냥 여기서 아 input 이랑 edit 페이지에서만 지우면 되는거지 테이블 이름도 마찬가지야. 사용자가 제어할 수 있게해서는 안되. URL로 넣어야 해
  // 이전 컬럼을 바꿔야 하는거니까 이전 컬럼 이름을 param으로 가져올 필요가 있어

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
    let sql = `SELECT * FROM ${table_name};`;
    let rows;
    conn.query(sql, function (err, results, fields) {
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

  // 테이블 생성 페이지 -- 생성과 동시에 id 값만이 존재하는 더미 행이 추가됨
  app.get('/input/table', function (req, res) {
    res.render('index', {
      page: 'input/table',
    });
  });

  // 테이블 생성 작업
  app.post('/input/table', function (req, res) {
    let table_name = req.body.table_name;
    conn.query();
  });

  // 테이블 행 생성 페이지
  app.get('/input/row/:table_name', function (req, res) {
    let columns = [];

    // 여기서 id 는 뺀다
    res.render('index', {
      page: 'input/row',
      columns: columns,
    });
  });

  // 테이블 행 생성 작업
  app.post('/input/row/:table_name', function (req, res) {
    let table_name = req.params.table_name;
  });

  // 테이블 열 생성 페이지
  app.get('/input/column/:table_name', function (req, res) {
    res.render('index', {
      page: 'input/column',
    });
  });

  // 테이블 열 생성 작업
  app.post('/input/column/:table_name', function (req, res) {
    let table_name = req.params.table_name;
  });

  /* ---------------------------------------------------------- EDIT */

  // 테이블 수정 페이지
  app.get('/edit/table/:table_name', function (req, res) {
    res.render('index', {
      page: 'edit/table',
    });
  });

  // 테이블 수정 작업
  app.post('/edit/table/:table_name', function (req, res) {
    let body = req.body;
    let table_name = req.params.table_name;
  });

  // 테이블 행 수정 페이지
  app.get('/edit/row/:table_name/:id', function (req, res) {
    res.render('index', {
      page: 'edit/row',
    });
  });

  // 테이블 행 수정 작업
  app.post('/edit/row/:table_name/:id', function (req, res) {
    let body = res.body;
    let table_name = req.params.table_name;
    let id = req.params.id;
  });

  // 테이블 열 수정 페이지
  app.get('/edit/column/:table_name/:column_name', function (req, res) {
    res.render('index', {
      page: 'edit/column',
    });
  });

  // 테이블 열 수정 작업
  app.post('/edit/column/:table_name/:column_name', function (req, res) {
    let body = res.body;
    let table_name = req.params.table_name;
    let column_name = req.params.column_name;

    res.redirect('/manage/table');
  });

  /* ---------------------------------------------------------- DELETE */

  // 테이블 삭제 작업
  app.get('/delete/table/:table_name', function (req, res) {
    let table_name = req.params.table_name;
    res.redirect(`/manage/table/${table_name}`);
  });

  // 테이블 행 삭제 작업
  app.get('/delete/row/:table_name/:id', function (req, res) {
    let table_name = req.params.table_name;
    let id = req.params.id;
    res.redirect(`/manage/table/${table_name}`);
  });

  // 테이블 열 삭제 작업
  app.get('/delete/column/:table_name/:column_name', function (req, res) {
    let table_name = req.params.table_name;
    let column_name = req.params.column_name;
    res.redirect(`/manage/table/${table_name}`);
  });

  /* ---------------------------------------------------------- INQUIRE */

  // 조회 페이지
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
