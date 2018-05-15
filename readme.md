# Alex Leigh's Portfolio Site API
This API is the backend for the portfolio site found at [daleighan.com](https://daleighan.com).
## About
* Requires a .env file containing the following information to run locally (The values of these items may be whatever you want): 
```
SECRET=[your secret here]
USERNAME=[username to set here]
PASSWORD=[password to set here]
```

* To run locally: `npm install && npm run dev`

* To deploy to AWS Lambda (requires AWS CLI to be installed): `serverless deploy`. The same environmental variables from the .env file above need to be set using the AWS console.

## Routes
Any of the routes below that are marked as secured require a token acquired from the `login` route.

#### Route: `/login`:
* POST request will return the JWT that is needed for access to the secured routes of this API. The body of the request must be: 

```
{ 
	username: [username here], 
	password: [password here]
}
```

### Route: `/projects`

* GET request will return all of the project entries contained in the table PROJECTS_TABLE
* (Secured) POST request will add a project to the table. The only required property is projectName, but any others will be added to the table entry. The body of the request must be:
```
{
	projectName: [your project's name],
	...[any other props]
}
```
* (Secured) PUT request will update an existing project in the table. The projectName property is needed. Any new properties are added to the table entry and any  properties that need to be updated are updated. The body of the request must be:
 ```
{
	projectName: [your project's name],
	...[props to update]
}
```
* (Secured) DELETE request will delete an entry in the PROJECT_TABLE. The body of the request must be:
```
{
	projectName: [your project's name]
}
```
