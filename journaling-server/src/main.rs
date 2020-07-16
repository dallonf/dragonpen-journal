use actix_web::{web, HttpResponse, HttpServer};
use listenfd::ListenFd;

async fn graphiql() -> HttpResponse {
    let html = juniper::http::graphiql::graphiql_source("/graphql");
    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html)
}

async fn graphql(
    data: web::Json<juniper::http::GraphQLRequest>,
    model: web::Data<model::ModelState>,
) -> Result<HttpResponse, actix_web::Error> {
    let response = web::block(move || {
        let response = data.execute(&gql::SCHEMA, &gql::Ctx(model.get_ref().clone()));
        serde_json::to_string(&response)
    })
    .await?;
    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(response))
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    let model = model::ModelState::new();

    let mut listenfd = ListenFd::from_env();
    let server = HttpServer::new(move || {
        actix_web::App::new()
            .data(model.clone())
            .route("/graphiql", web::get().to(graphiql))
            .route("/graphql", web::post().to(graphql))
    });

    let server = if let Some(l) = listenfd.take_tcp_listener(0).unwrap() {
        server.listen(l)?
    } else {
        server.bind("127.0.0.1:4000")?
    };

    server.run().await
}
