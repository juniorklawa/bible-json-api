FROM nginx:alpine

COPY summary/ /usr/share/nginx/html/summary/
COPY versions/ /usr/share/nginx/html/versions/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 