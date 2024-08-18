import { createContext, useEffect, useState } from "react";
import { food_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4000/";
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(null);
  const [food_list, setFood_list] = useState([]);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }

    if (token) {
      await axios.post(
        `${url}api/cart/add`,
        { itemId },
        { headers: { token } }
      );
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(
        `${url}api/cart/remove`,
        { itemId },
        { headers: { token } }
      );
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(`${url}api/food/list`);
    setFood_list(response.data.data);
  };

  //Get the list of items in the cart from the server
  const loadCartData = async (token) => {
    const response = await axios.post(
      `${url}api/cart/get`,
      {},
      {
        headers: { token },
      }
    );
    console.log(response.data);

    setCartItems(response.data.cartData);
  };

  useEffect(() => {
    async function loadFoodData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }

    loadFoodData();
  }, []);

  const contextValue = {
    url,
    token,
    setToken,
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
  };
  return (
    <div>
      <StoreContext.Provider value={contextValue}>
        {children}
      </StoreContext.Provider>
    </div>
  );
};

export default StoreContextProvider;
