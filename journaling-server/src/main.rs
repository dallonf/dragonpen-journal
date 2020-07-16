use actix_web::{web, HttpResponse, HttpServer};

async fn graphiql() -> HttpResponse {
    let html = juniper::http::graphiql::graphiql_source("/graphql");
    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html)
}

async fn graphql(
    data: web::Json<juniper::http::GraphQLRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let response = web::block(move || {
        let response = data.execute(&gql::SCHEMA, &());
        serde_json::to_string(&response)
    })
    .await?;
    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(response))
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        actix_web::App::new()
            .route("/graphiql", web::get().to(graphiql))
            .route("/graphql", web::post().to(graphql))
    })
    .bind("127.0.0.1:4000")?
    .run()
    .await
}
