//manejar metodos a traves de objetos o de objetos literales
//se simula una base de datos pero se hace solo desde front

const db = {
    //declaro funciones dentro de methods
    methods:{
        find: id =>{
            return db.items.find(item => item.id == id);
        },
        //remueve los items comprados seria, el stock
        remove: items =>{
            items.forEach(item => {
                const product = db.items.find(item => item.id ==item.id);
                product.qty = product.qty - items.qty;
            });

            console.log(db);
        }
    },
    items: [
        {
            id:0,
            title: "Funko Pop",
            price: 250,
            qty: 5 //cantidad
        },
        {
            id:1,
            title: "Harry Potter Book",
            price: 550,
            qty: 70
        },
        {
            id:2,
            title: "Levi blade",
            price: 2780,
            qty: 2
        }
    ]
};

const shoppingCart = {
    items: [],
    methods: {
        add: (id, qty) => {
            const cartItem = shoppingCart.methods.get(id);//si ya existe en el carrito
            if(cartItem){//si es distinto de null
                //la cantidad es la nueva mas la que ya tenia agregada al carrito
                if (shoppingCart.methods.hasInventory(id, qty + cartItem.qty)) {
                    cartItem.qty += qty;
                }else{
                    alert("no hay inventario suficiente");
                }
            }else{//si es la primera vez que agrego el item al carrito
                shoppingCart.items.push({id,qty});
            }
        },

        remove: (id, qty) => {
            const cartItem = shoppingCart.methods.get(id);//si ya existe en el carrito
            if (cartItem.qty - qty >0) {
                cartItem.qty -= qty;
            }else{//si ya no podemos eliminar
                shoppingCart.items = shoppingCart.items.filter(item => item.id != id);
            }
        },

        count: () => {
            //porque reduce en vez de length, porque tiene que sumar las cantidades, en si multiplicarlas por el precio
            //pide un acumulador y un item por parametro
            return shoppingCart.items.reduce((acc, item) => acc + item.qty, 0); 
            //cero de final es con cuanto inicializa el acumulador
        },

        get: (id) => {
            const index = shoppingCart.items.findIndex(item => item.id == id);
            return index >= 0 ? shoppingCart.items[index] : null;
        },

        getTotal: () => {
            //se puede hacer con forEach o con reduce
            let total = shoppingCart.items.reduce((acc, item) => {
                const found = db.methods.find(item.id);
                return acc + found.price * item.qty;
            },0); //cero de final es con cuanto inicializa el acumulador
            return total;
        },

        hasInventory: (id,qty) => {
            //verifico si al restarle la cantidad que quiero me da mayor o igual a cero es 
            //que puedo comprar esa cantidad
            return db.items.find(item => item.id == id).qty- qty >= 0;
        },

        purchase: () => {
            db.methods.remove(shoppingCart.items);
            shoppingCart.items = [];
        },
    }
};

renderStore();

function renderStore(){
    const html = db.items.map(item => {
        return `<div class="item">
                    <div class="title">${item.title}</div>
                    <div class="price">${numberToCurrency(item.price)}</div>
                    <div class="qty">${item.qty} Units</div>

                    <div class="actions">
                        <button class="add" data-id="${item.id}">Add to Shopping Cart</button>
                    </div>
                </div>
                `;
    });

    document.querySelector("#store-container").innerHTML = html.join("");
    document.querySelectorAll(".item .actions .add").forEach(button => {
        button.addEventListener("click", e => {
            const id = parseInt(button.getAttribute("data-id"));//hago el parse porque devuelve un string
            const item = db.methods.find(id);

            if (item && item.qty-1 > 0) {
                //item existe y cantida menos 1 sigue siendo mayor que cero osea hay stock
                //añadir al shoppingCart
                shoppingCart.methods.add(id, 1);
                renderShoppingCart();
            }else{
                console.log("Ya no hay inventario");
            }
        });
    });
}

function renderShoppingCart(){
    const html = shoppingCart.items.map(item => {
        const dbItem = db.methods.find(item.id);
        return `
                <div class="item">
                    <div class="title">${dbItem.title}</div>
                    <div class="price">${numberToCurrency(dbItem.price)}</div>
                    <div class="qty">${item.qty} Units</div>
                    <div class="subtotal">Subtotal: ${numberToCurrency(item.qty * dbItem.price)} Units</div>

                    <div class="actions">
                        <button class="addOne" data-id="${item.id}">+</button>
                        <button class="removeOne" data-id="${item.id}">-</button>
                    </div>
                </div>
        `;
    });

    const closeButton  = `
                        <div class="cart-header">
                            <button class="bClose">Close</button>
                        </div>
    `;

    const purchaseButton  = shoppingCart.items.length > 0 ? `
                        <div class="cart-actions">
                            <button id="bPurchase">Purchase</button>
                        </div>
    ` : "";

    const total = shoppingCart.methods.getTotal();
    const totalContainer = `<div class="total">Total: ${numberToCurrency(total)}</div>`;

    const shoppingCartContainer = document.querySelector("#shopping-cart-container");

    //esto no se si esta bien ubicado, no se oculta despues de comprar
    shoppingCartContainer.classList.add("show");
    shoppingCartContainer.classList.remove("hide");

    shoppingCartContainer.innerHTML = closeButton + html.join("") + totalContainer + purchaseButton;



    document.querySelectorAll(".addOne").forEach(button => {
        button.addEventListener("click", e => {
            const id = parseInt(button.getAttribute("data-id"));
            shoppingCart.methods.add(id, 1);
            renderShoppingCart();

        });
    });
    document.querySelectorAll(".removeOne").forEach(button => {
        button.addEventListener("click", e => {
            const id = parseInt(button.getAttribute("data-id"));
            shoppingCart.methods.remove(id, 1);
            renderShoppingCart();
        });
    });

    document.querySelector(".bClose").addEventListener("click", e => {
        shoppingCartContainer.classList.remove("show");
        shoppingCartContainer.classList.add("hide");
    });

    const bPurchase = document.querySelector("#bPurchase");
    if (bPurchase) {
        bPurchase.addEventListener("click", e => {
            shoppingCart.methods.purchase();
            renderStore();//actualiza las cantidades
            renderShoppingCart();
        });
    }
}

//porque quiero mostrar el precio con signo de dolar
function numberToCurrency(number){
    //api llamada intenational
    return new Intl.NumberFormat("en-US",{
        maximumSignificantDigits:2,//dos digitos decimales
        style: "currency",
        currency: "USD"
    }).format(number); //quiero que le apliques ese formato a mi variable n 
}