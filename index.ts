import express,{Express, Request, Response , NextFunction} from 'express'
import {writeFile , readFile, readFileSync, writeFileSync} from 'fs'
import { User } from './interface'
import path, { format } from 'path'
import { buffer } from 'stream/consumers'
const ejs = require('ejs')
const app = express()
const bodyParser = require('body-parser')
import { Expences } from './interface'

let expenses:any= check(readFileSync('expences.json','utf8'))
let users:any = check(readFileSync('data.json','utf8'))
// readExpensesFromDataJson()



const sessionStorage = require('sessionstorage-for-nodejs');


app.use(bodyParser.urlencoded({extended:true}))
app.use("/static", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

function tokenMidlleware(req:Request,res:Response,next:NextFunction){
    const token = sessionStorage.getItem('accessToken')
    if (!token) {
        res.status(400)
        res.redirect('/signin')
        return
    }
    const myId = (req as any);
    
    myId["id"] = token 
    next()
}

app.get('/',tokenMidlleware, (req,res)=>{
    const myId = (req as any)
    const userId = myId["id"]
    const currentuser = users.find((el:User)=>{
        return el.id == userId
    })
    const currenexpenses = expenses.filter((el:Expences)=>{
        return el.userId == userId
    })
    setTimeout(()=>console.log(sessionStorage.getItem('accessToken')),1000)
    
    res.status(200)
    res.render('expences',{user:currentuser,expenses:currenexpenses})
})

app.get('/signup',(req,res)=>{
    res.render('signup')
})



app.post('/signup', (req,res)=>{
    const body = req.body
    const currentuser = users.find((el:User) =>{
        return el.email === body.email
    })
    if (currentuser) {
        console.log('eror on 28', currentuser);
        res.status(400)
        res.send({message:'bad requesttt'})
        return
    }
    const user = {
        ...body,
        id:Date.now(),
        createdAt: '2023/10/13'
    } 
    users.push(user)
    writeFileSync('data.json', JSON.stringify(users))
    sessionStorage.setItem("accessToken", currentuser.id)
    res.status(200)
    res.redirect('/expences')
})

app.get('/signin', (req,res)=>{
    res.render('signin')
    console.log(sessionStorage.getItem('accessToken'));
    
})

app.post('/signin', (req,res)=>{
    const body = req.body
    const currentuser = users.find((el:User) =>{
        return el.email === body.email
    })
    if (!currentuser) {
        res.status(400)
        res.send({message:'bad request no user'})
        return
    }
    if (currentuser.password !== body.password) {
        res.status(400)
        res.send({message:'bad request no pass'})
        return
    }
    sessionStorage.setItem("accessToken", currentuser.id)
    const currenexpenses = expenses.filter((el:Expences)=>{
        return el.userId == currentuser.id
    })
    res.redirect('/')
    res.status(200)
    })






app.get('/add-expense', tokenMidlleware,(req,res)=>{
    res.status(200)
    res.render('add-expense')
})

app.post('/add-expense',tokenMidlleware, (req,res)=>{
    res.status(200)
    const body = req.body
    const myId = (req as any)
    const userId = myId["id"]
    const currenexpense = {
        ...body,
        id: Date.now(),
        userId:userId
    }
    expenses.push(currenexpense)
    // writeFileSync('expences.json', JSON.stringify(expenses))
    writeFile('expences.json', JSON.stringify(expenses), (err)=>{
        if (err) {
            console.log('writefile error');
            return
        }
        sessionStorage.setItem("accessToken", userId)
    })

    
    res.redirect('/')
})


app.listen(3000,()=>{
    console.log('server is not running');
})




function check (data:any){
    if(data == '')
    {
        return[]
    }
    return JSON.parse(data)
}