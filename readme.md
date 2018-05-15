# Request To Swagger

## Assumptions

* This tool only generates Swagger 2.0 as at the time of writing, most client generation
does not support Swagger 3.0
* This tool will try to differentiate between integers and numbers,
but this may not always be right due to JavaScript's type limitations
* Null is not currently supported by Swagger 2.0
* Empty Arrays and Null values will be ignored during schema duration. However, the assumption is that this 
type information will eventually be defined within your request/response so this should not be an issue when
multiple valid responses are merged together.
* This tool only generates inferred schemas for JSON. XML and other data types will be treated as strings.

## Requirements

* All generated swagger docs should be valid swagger

