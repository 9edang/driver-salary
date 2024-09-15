# How to Run

* rename .env.example to .env
* fill value of .env
* install dependency ```npm ci```
* run migration ```make migrate-up``` (linux OS required, if use different OS: [references](https://github.com/golang-migrate/migrate/releases))
* run seeder ```npm run seed```
* run app ```npm run start```