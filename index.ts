import { mySetTimeout, MyPromise,myYield } from "./event_loop";



/** 
 async function CoroutineExample( ) {    
    for(let i=0;i<10;i++){
        if(i==5){
          await new MyPromise((r)=>{
            mySetTimeout(()=>{
                r("ok")
            },1000)
        });  
        }
        
        console.log("CoroutineExample",i);
    }
}
协程代码等价于下面这个状态机代码
*/

/**
 *  b1 {i=0;}
 *  b2 { i<10;} ？ b3 : b6
 *  b3 { i==5;} ？ b4 : b5
 *  b4 {await ... } -->control is yielded,保存当前变量， pc=5,当await的代码执行完毕后 接着执行CoroutineExample
 *  b5 {console.log;i++} -->b2
 *  b6 {return }
*/
async function CoroutineExample(localVar: Record<string, any>, pc: number) {
    for (; ;) {
        switch (pc) {
            case 1: localVar.i = 0; pc = 2; break;
            case 2: if (localVar.i < 10) { pc = 3; } else { pc = 6; } break;
            case 3: if (localVar.i == 5) { pc = 4; } else { pc = 5; } break;          
            case 4: {                 
                myYield(new MyPromise(r=>{
                    console.log("await 1000")
                    mySetTimeout(()=>{                        
                        r("ok")
                    },1000)
                }),CoroutineExample,5,localVar);

            return;    
            } 
            case 5: {
                console.log("CoroutineExample", localVar.i);
                localVar.i++;
                pc = 2;
            } break;
            case 6: return;

        }
    }

}


function test1() {
    mySetTimeout(function () {
        console.log("Hello 1000");
    }, 1000);
    mySetTimeout(function () {
        console.log("Hello 500");
    }, 500);
    mySetTimeout(function () {
        mySetTimeout(function () {
            console.log("Hello 700");
        }, 600)
        console.log("Hello 100");
    }, 100);
    console.log("World");
}
function teest2() {
    const p = new MyPromise((resolve, reject) => {
        resolve("world");
    });
    console.log("Hello");
    mySetTimeout(function () {
        console.log("200 timeout");
    }, 200);
    p.then(v => {
        console.log(v, "then run");
        return new MyPromise(r => {
            r("Hello world");

        })
    }).then(v => {
        console.log(v, "last");
    })
}
//test1();

//teest2();

 CoroutineExample({i:0},1);