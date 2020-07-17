use actix_cors::Cors;
use actix_web::{http, web, HttpRequest, HttpResponse, HttpServer};
use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use async_graphql_actix_web as gql_web;
use listenfd::ListenFd;

async fn gql_playground() -> HttpResponse {
    let html =
        playground_source(GraphQLPlaygroundConfig::new("/graphql").subscription_endpoint("/graphql"));
    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html)
}

async fn graphql(
    req: gql_web::GQLRequest,
    model: web::Data<model::ModelState>,
) -> gql_web::GQLResponse {
    req.into_inner()
        .data(model.get_ref().clone())
        .execute(&gql::SCHEMA)
        .await
        .into()
}

async fn graphql_ws(req: HttpRequest, payload: web::Payload) -> actix_web::Result<HttpResponse> {
    actix_web_actors::ws::start_with_protocols(
        gql_web::WSSubscription::new(&gql::SCHEMA),
        &["graphql-ws"],
        &req,
        payload,
    )
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    let model = model::ModelState::new();

    let mut listenfd = ListenFd::from_env();
    let server = HttpServer::new(move || {
        actix_web::App::new().data(model.clone()).service(
            web::resource("/graphql")
                .wrap(
                    Cors::new()
                        .allowed_methods(vec!["POST"])
                        .allowed_headers(vec![http::header::CONTENT_TYPE])
                        .finish(),
                )
                .route(
                    web::get()
                        .guard(actix_web::guard::Header("upgrade", "websocket"))
                        .to(graphql_ws),
                )
                .route(web::get().to(gql_playground))
                .route(web::post().to(graphql)),
        )
    });

    let server = if let Some(l) = listenfd.take_tcp_listener(0).unwrap() {
        server.listen(l)?
    } else {
        server.bind("127.0.0.1:4000")?
    };

    server.run().await
}
