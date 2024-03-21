function sleep(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
}

abstract class Task {
    public abstract isDone(): boolean;
    constructor(public callback: () => void) { }
}

class TimeoutTask extends Task {
    private time: number = 0;
    constructor(callback: () => void, time: number) {
        super(callback);
        this.time = time + Date.now();
    }
    public isDone(): boolean {
        return this.time <= Date.now();
    }
}

class PromiseTask extends Task {

    constructor(callback: () => void) {
        super(callback);

    }
    public isDone(): boolean {
        return true;
    }
}
export function mySetTimeout(callback: () => void, time: number) {
    queue.push(new TimeoutTask(callback, time));
}
 
type CoroutineFn=(v:Record<string,any>,pc:number)=>void;

export function myYield( p:MyPromise  ,code:CoroutineFn,pc:number,localVar:Record<string,any>){
    p.then(v=>{
        code(localVar,pc)
        return v;
    })

}

class CoroutineTask extends Task {
    public isDone(): boolean {
        return true;
    }
    private stackStore:Record<string,any>={};
    private pc:number = 0;
    save(v:Record<string,any>){
        this.stackStore = v;
    }

}


let queue = new Array<Task>();




type ResolveType = (value?: any) => void;
type RejectType = (reason?: any) => void;
type ExecutorType = (resolve: ResolveType, reject: RejectType) => void;
type ThenCallbackType = (value: any) => any;

export class MyPromise {
    public done = "pending";
    private value: any;
    queue = new Array<ThenCallbackType>;
    constructor(fn?: ExecutorType) {
        if (fn) {
            fn(this.resolve.bind(this), this.reject.bind(this));
        }

    }
    public then(callback: ThenCallbackType) {
        const ret = new MyPromise()
        queue.push(new PromiseTask(() => {
            if (this.done == "fulfilled") {
                let x = callback(this.value);
                if (x instanceof MyPromise) {
                    x.then(d => {
                        ret.resolve(d);
                    })
                }else{
                    ret.resolve(x);
                }
            }else if(this.done == "pending"){
                this.queue.push((value)=>{
                    let x = callback(value);
                    if (x instanceof MyPromise) {
                        x.then(d => {
                            ret.resolve(d);
                        })
                    }else{
                        ret.resolve(x);
                    }
                })
            }
        }))
        return ret;


    }
    public reject() {
        this.done = "rejected";
    }
    public resolve(value: any) {
        if (this.done == "pending") {
            this.done = "fulfilled";
            this.value = value;
            for (let i = 0; i < this.queue.length; i++) {
                this.queue[i](value);
            }
        }

    }


}





async function loop() {
    for (; ;) {
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].isDone()) {
                queue[i].callback();
                queue.splice(i, 1);
                i--;
            }
        }
        await sleep(1);
    }
}
loop();

