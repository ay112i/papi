const mysql = require('mysql2');
const express= require('express');
const cors = require('cors');
const axios = require('axios');
// Connect to MySQL
const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config(); // only needed if using .env locally
// const db = mysql.createConnection(process.env.DATABASE_URL);
const db = mysql.createConnection(process.env.MYSQL_PUBLIC_URL);

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'mysql',
//   database: 'r_qc'
// });

db.connect(err => {
  if (err) throw err;
  console.log('ok1');

  // Simple query
//   db.query('SELECT * FROM r_test', (err, results) => {
//     if (err) throw err;
//     console.log(results);
//     db.end();
//   });
});

app.get('/122', async (req, res)=>{
    const page= Number(req.query.page)|| 1
    const  limit=3
    const offset= (page-1)*limit
    const sql=`select*from r_qc.r_post_t order by id limit ${limit} offset ${offset}`;    

    db.query('select count(*)as ttl from r_qc.r_post_t', (err,rs)=>{
        if(err) return res.status(500).json({error: err.message})
        
      
    const ps= Math.ceil(rs[0].ttl/ limit)

    db.query(sql, (err,rs)=>{
        if(err) return res.status(500).json({error: err.message})

        res.json({ps,page,
          ar0: rs
        })
    })
   })
  })

app.get('/120', async (req, res)=>{
  try{
    const rs= await axios.get(
        'https://hn.algolia.com/api/v1/search?query=poker'
    );

    const dt= rs.data.hits.slice(0,5).map(i => ([
        i.title,
        i.author,
        i.url,
    ]))

    const sql='insert into r_t3(title,author,url)values ?';

    db.query(sql, [dt], err=>{
        if(err) throw err;
        res.json({count: dt.length});
    });
   } catch(err){
    res.status(500).json({error: err.message});
   }
});

app.post('/124', (req,res)=>{
  const {nm}= req.body.data;

  const sql= 'insert into r_qc.r_contact_t (nm) values(?)';

  db.query(sql, [nm], (err,rs)=>{
    if(err){return res.status(500).json({ er: err.message});}
     res.json({success:true
        });
  })

})

app.put('/124/:id', (req,res)=>{
  const {nm}=req.body.data;
  const {id}= req.params;

  const sql= 'update r_qc.r_contact_t set nm=? where id=?'
  db.query(sql, [nm,id], (err,rs)=>{
    if(err) return res.status(500).json({er: err.message});
    res.json({well: true});
  })
})

app.get('/top', async (req,res)=>{
  const sql=`select distinct topic from railway.r_note`;

  db.query(sql, (err,rs)=>{
    if(err) return res.status(500)

    res.json({t1: rs})
  })
})
app.listen(3000, ()=>{
    console.log('run3');
})

app.get('/sub/:id', async (req,res)=>{
  const {id}= req.params;
  const sql= `select* from r_qc.r_note where topic=?`;
  db.query(sql, [id], (err,rs)=>{
    if(err) return res.status(500)
    res.json({dt: rs})
 
  })
  
})