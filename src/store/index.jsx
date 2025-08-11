import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import axios from "axios";
import { useState } from "react";
import baseUrl from "../config"

const savedUser = JSON.parse(localStorage.getItem("user"));


export const fetchMembers = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/alumni/all`);
    console.log("settings data", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching members:", error);
    return null;
  }
};

export const fetchSettings = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/settings/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};

export const fetchProfileData = async () => {
  try {


    const cookieString = document.cookie;
    



    const tokenStartIndex = cookieString.indexOf('=');

// Extract the token part
    const jwtToken = cookieString.slice(tokenStartIndex + 1);

    const payloadBase64 = jwtToken.split('.')[1];

// Decode the base64 payload
const decodedPayload = atob(payloadBase64)

// Parse the JSON string
const decodedToken = JSON.parse(decodedPayload);

// Extract the userId
const userId = decodedToken ? decodedToken.userId : null;
const accessToken = jwtToken;
  
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/alumni/${userId}`,
      { headers }
    );
    console.log("profile data", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Profile data:", error);
    return null;
  }
};

const initializeStore = async () => {
  try {
    // const [initialSettings, initialProfile, initialMembers] = await Promise.all([
    const [ initialProfile] = await Promise.all([
      // fetchSettings(),
      fetchProfileData(),
      // fetchMembers(),
    ]);

    const preloadedState = {
      user: {
        user: savedUser || null,
        isLoggedIn: !!savedUser,
      },
      posts: {
        posts: [],
      },
      // settings: initialSettings || {},
      profile: initialProfile || {},
      // member: initialMembers || {},
      webSocket: {
        ws: null,
      },
    };

    return configureStore({
      reducer: rootReducer,
      preloadedState,
    });
  } catch (error) {
    console.error("Error initializing store:", error);
    return configureStore({
      reducer: rootReducer,
    });
  }
};

const storePromise = initializeStore();

export default storePromise;