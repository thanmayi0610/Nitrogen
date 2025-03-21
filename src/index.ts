import { serve } from '@hono/node-server'
import { Hono } from 'hono'
const app = new Hono()
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


// await prisma.customer.create({
//   data: {
//     name: "Namitha",
//     email: "bhovi@gmail.com",
//     phoneNumber: "1234567890",
//     address: "Udupi",
//   },
// });

// await prisma.restaurant.create({
//   data: {
//     name: "Vilasi Delight",
//     location: "Tumkur",
//   },
// });
// await prisma.restaurant.create({
//   data: {
//     name: "Dominos",
//     location: "Tumkur",
//   },
// });


// await prisma.menuItem.create({
//   data: {
//     name: "Margherita Pizza",
//     price: 499,
//     restaurant: { connect: { id: "40d1cf76-75fa-429e-b339-138b718693d4" } },
//   },
// });
//async function main() {
  // Add a customer
  // const customer = await prisma.customer.create({
  //   data: {
  //     name: "John Doe",
  //     email: "johndoe@example.com",
  //     phoneNumber: "1234567890",
  //     address: "123 Main St, City, Country",
  //   },
  // });
  // console.log("Customer added:", customer);
  // // Add a restaurant
  // const restaurant = await prisma.restaurant.create({
  //   data: {
  //     name: "Delicious Bites",
  //     location: "456 Market St, City, Country",
  //   },
  // });
  // console.log("Restaurant added:", restaurant);
  // Add a menu item
  // const menuItem = await prisma.menuItem.create({
  //   data: {
  //     name: "Dal kichadi",
  //     price: 250,
  //     restaurantId: "6362ceab-b084-4375-9d60-d597c94b18a5",
  //   },
  // });
  // console.log("Menu Item added:", menuItem);
  // Add an order
//   const order = await prisma.order.create({
//     data: {
//       customerId: "31858fc7-a01e-44d8-a817-e84f768baa5d",
//       restaurantId: "40d1cf76-75fa-429e-b339-138b718693d4",
//       status: "Placed",
//       totalPrice: 499,
//       items: {
//         create: [
//           {
//             menuItemId: "dc813d52-3270-4456-9e92-f99adf818c46",
//             quantity: 1,
//           },
//         ],
//       },
//     },
//     include: { items: true },
//   });
//   console.log("Order added:", order);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

//  1. Customers

// POST  Register a new customer
app.post("/customers", async (c) => {
  try {
    const { name, email, phoneNumber, address } = await c.req.json();

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return c.json({ error: "Customer with this email already exists" }, 400);
    }

    const newCustomer = await prisma.customer.create({
      data: { name, email, phoneNumber, address },
    });

    return c.json(newCustomer, 201);
  } catch (error) {
    console.error("Error creating customer:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// GET Retrieve details of a customer
app.get("/customers/:id", async (c) => {
  try {
    const customerId = c.req.param("id");

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    return c.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// GET Retrieve all orders placed by this customer
app.get("/customers/:id/orders", async (c) => {
  try {
    const customerId = c.req.param("id");

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        restaurant: { select: { name: true } },
        items: {
          select: {
            menuItem: { select: { name: true, price: true } },
            quantity: true,
          },
        },
      },
    });

    return c.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

//  2. Restaurants

// POST Register a new restaurant
app.post("/restaurants", async (c) => {
  try {
    const { name, location } = await c.req.json();

    // Check if restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { name },
    });

    if (existingRestaurant) {
      return c.json({ error: "Restaurant with this name already exists" }, 400);
    }

    const newRestaurant = await prisma.restaurant.create({
      data: { name, location },
    });

    return c.json(newRestaurant, 201);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// GET Get all available menu items from a restaurant
app.get("/restaurants/:id/menu", async (c) => {
  try {
    const restaurantId = c.req.param("id");

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId, isAvailable: true },
      select: { id: true, name: true, price: true },
    });

    return c.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// 3. Menu Items

// POST  Add a menu item to a restaurant
app.post("/restaurants/:id/menu", async (c) => {
  try {
    const restaurantId = c.req.param("id");
    const { name, price, isAvailable } = await c.req.json();

    const newMenuItem = await prisma.menuItem.create({
      data: { name, price, isAvailable, restaurantId },
    });

    return c.json(newMenuItem, 201);
  } catch (error) {
    console.error("Error adding menu item:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// PATCH  Update availability or price of a menu item
app.patch("/menu/:id", async (c) => {
  try {
    const menuItemId = c.req.param("id");
    const { price, isAvailable } = await c.req.json();

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { price, isAvailable },
    });

    return c.json(updatedMenuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.post("/orders", async (context) => {
  try {
    const { customerId, restaurantId, orderItems } = await context.req.json();

    // Check if customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return context.json({ error: "Customer not found" }, 404);
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      return context.json({ error: "Restaurant not found" }, 404);
    }

    let totalPrice = 0;
    

    // Validate menu items and calculate total price
    for (const item of orderItems) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });

      if (!menuItem) {
        return context.json({ error: `Menu item with id ${item.menuItemId} not found` }, 404);
      }
      if (!menuItem.isAvailable) {
        return context.json({ error: `Menu item ${menuItem.name} is not available` }, 400);
      }

      totalPrice += Number(menuItem.price) * item.quantity;
      
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId,
        restaurantId,
        totalPrice,
      
        items: {
          create: orderItems.map(
            (item: { menuItemId: string; quantity: number }) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })
          )
        },
      },
      include: { items: true }, // Include order items in response
    });

    return context.json(order, 201);
  } catch (error) {
    console.error("Error placing order:", error);
    return context.json({ error: "Internal Server Error" }, 500);
  }
});




serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
