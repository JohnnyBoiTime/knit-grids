import axios from 'axios'

const ASPROUTE = axios.create({
  // baseURL: `${process.env.NEXT_PUBLIC_DJANGO_API_ROUTE}`, 
  baseURL: `${process.env.NEXT_PUBLIC_ASPNET_API_ROUTE}/api`, 
  withCredentials: true,
})

export default ASPROUTE;