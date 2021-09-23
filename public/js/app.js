const cartButtons = document.querySelectorAll(".add-cart");
const cartItemsNumber = document.querySelector(".cart-items-no");
const headerCart = document.querySelector("header .cart");
const orderInput = document.querySelector(".order-wrapper input");
const orderStatuses = document.querySelectorAll(".order-statuses li");
const statusSelects = document.querySelectorAll(".statuses-select");
const adminOrdersWrapper = document.querySelector(
  ".admin-orders-wrapper table"
);

headerCart.addEventListener("click", (e) => {
  window.location = "/cart";
});

cartButtons.forEach((cartButton) => {
  cartButton.addEventListener("click", (e) => {
    const pizzaId = cartButton.getAttribute("data-pizzaId");

    axios
      .post(`/cart/${pizzaId}`)
      .then(function (response) {
        cartItemsNumber.innerText = response.data.totalQuantity;
        new Noty({
          type: "success",
          text: "Pizza added to cart.",
          timeout: 1000,
        }).show();
      })
      .catch(function (error) {
        new Noty({
          type: "alert",
          text: "Something went wrong.",
          timeout: 1000,
        }).show();
      });
  });
});

updateOrderStatus();

statusSelects.forEach((statusSelect) => {
  statusSelect.addEventListener("change", (e) => {
    const orderId = statusSelect.getAttribute("data-orderId");
    const orderStatusValue = e.target.value;

    axios
      .put(`/orders/${orderId}`, { orderStatus: orderStatusValue })
      .then(function (response) {
        new Noty({
          type: "success",
          text: "Order updated.",
          timeout: 1000,
        }).show();
      })
      .catch(function (error) {
        new Noty({
          type: "alert",
          text: "Something went wrong.",
          timeout: 1000,
        }).show();
      });
  });
});

function updateOrderStatus(orderData) {
  orderStatuses.forEach((orderStatus) => {
    // const timeSpan = orderStatus.querySelector(".order-status-time");
    // timeSpan.remove();
    orderStatus.classList.remove("completed");
    orderStatus.classList.remove("current");
  });

  let statusCompleted = true;
  orderStatuses.forEach((orderStatus, index, orderStatuses) => {
    const order = JSON.parse(orderInput.value);
    order.orderStatus = orderData ? orderData.orderStatus : order.orderStatus;
    const status = orderStatus.getAttribute("data-status");

    if (statusCompleted) {
      orderStatuses.forEach((orderStatus) => {
        const timeSpan = orderStatus.querySelector(".order-status-time");
        if (timeSpan) timeSpan.remove();
      });
      orderStatus.classList.add("completed");
    }

    if (status === order.orderStatus) {
      statusCompleted = false;
      const span = document.createElement("span");
      span.classList.add("order-status-time");
      span.innerText =
        orderData && orderData.updatedAt
          ? moment(orderData.updatedAt).format("hh:mm A")
          : moment(order.createdAt).format("hh:mm A");

      const nextOrderStatus =
        orderStatuses.length - 1 === index ? "" : orderStatuses[index + 1];

      orderStatus.appendChild(span);
      // orderStatus.classList.add("completed");
      if (nextOrderStatus) nextOrderStatus.classList.add("current");
    }
  });
}

// socket implemntation
const url = window.location.pathname;

const socket = io();

if (orderInput) {
  const order = JSON.parse(orderInput.value);
  socket.emit("join", `order_${order._id}`);
}

if (url.includes("admin")) {
  socket.emit("join", "adminRoom");
}

socket.on("orderUpdated", (orderData) => {
  new Noty({
    type: "success",
    text: "Order updated.",
    timeout: 1000,
  }).show();
  updateOrderStatus(orderData);
});

socket.on("orderPlaced", (order) => {
  console.log("Order placed.");
  new Noty({
    type: "success",
    text: "New order placed.",
    timeout: 1000,
  }).show();
  // updateOrderStatus(orderData);
  const orderMarkup = generateOrderMarkup(order);
  console.log("Order placed 2.");

  if (adminOrdersWrapper) {
    console.log("Order placed 3.");

    const orderTableBody = adminOrdersWrapper.children[1];
    orderTableBody.prepend(orderMarkup);
  }

  console.log("Order placed 4.");
});

function renderPizzas(pizzas) {
  const pizzasMarkup = [];
  for (let item of Object.values(pizzas)) {
    const pizza = `<h5>${item.pizza.name} - ${item.quantity} pcs</h5>`;
    pizzasMarkup.push(pizza);
  }

  return pizzasMarkup.join("");
}

function generateOrderMarkup(order) {
  const tableRow = document.createElement("tr");

  // orderDescTableData
  const orderDescTableData = document.createElement("td");
  const orderDescDiv = document.createElement("div");
  orderDescDiv.classList.add("order-desc");
  // header
  const orderDescHeader = document.createElement("h3");
  orderDescHeader.innerText = order._id;
  orderDescDiv.appendChild(orderDescHeader);
  // orderDescItems
  for (let item of Object.values(order.pizzas)) {
    const orderItemHeader = document.createElement("h5");
    orderItemHeader.innerText = `${item.pizza.name} - ${item.quantity} pcs.`;
    orderDescDiv.appendChild(orderItemHeader);
  }
  orderDescTableData.appendChild(orderDescDiv);

  // customerTableData
  const customerTableData = document.createElement("td");
  customerTableData.innerText = order.customerId.name;

  // addressTableData
  const addressTableData = document.createElement("td");
  addressTableData.innerText = order.address;

  // orderStatusesTableData
  const orderStatusesTableData = document.createElement("td");
  // statusesSelect
  const statusesSelect = document.createElement("select");
  statusesSelect.setAttribute("name", "statuses-select");
  statusesSelect.setAttribute("data-orderId", order._id);
  statusesSelect.classList.add("statuses-select");
  statusesSelect.setAttribute("id", "statuses-select");
  statusesSelect.addEventListener("change", (e) => {
    const orderId = statusesSelect.getAttribute("data-orderId");
    const orderStatusValue = e.target.value;

    axios
      .put(`/orders/${orderId}`, { orderStatus: orderStatusValue })
      .then(function (response) {
        new Noty({
          type: "success",
          text: "Order updated.",
          timeout: 1000,
        }).show();
      })
      .catch(function (error) {
        new Noty({
          type: "alert",
          text: "Something went wrong.",
          timeout: 1000,
        }).show();
      });
  });
  // statusesSelectOptions
  const options = [
    "order_placed",
    "confirmed",
    "prepared",
    "delivered",
    "completed",
  ];
  options.forEach((option) => {
    const SelectOption = document.createElement("option");
    SelectOption.setAttribute("value", option);
    SelectOption.innerText = option;
    if (option === order.orderStatus)
      SelectOption.setAttribute("selected", "selected");

    statusesSelect.appendChild(SelectOption);
  });
  orderStatusesTableData.appendChild(statusesSelect);

  // orderCreatedTableData
  const orderCreatedTableData = document.createElement("td");
  orderCreatedTableData.innerText = moment(order.createdAt).format("hh:mm A");

  /// orderPaymentTableDAta
  const orderPaymentTableData = document.createElement("td");
  orderPaymentTableData.innerText = order.paymentStatus ? "paid" : "Not paid";

  tableRow.appendChild(orderDescTableData);
  tableRow.appendChild(customerTableData);
  tableRow.appendChild(addressTableData);
  tableRow.appendChild(orderStatusesTableData);
  tableRow.appendChild(orderCreatedTableData);
  tableRow.appendChild(orderPaymentTableData);

  return tableRow;
}
