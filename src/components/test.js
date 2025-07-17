import React  from "react";
import { configDotenv } from "dotenv";

configDotenv();

import React from 'react'

const test = () => {

    console.log("base URL:", process.env.BASE_URL); // Log the BASE_URL for debugging
  return (

    <div>test</div>
  )
}

export default test