async fn index() -> impl actix_web::Responder {
    "Hello world!"
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    actix_web::HttpServer::new(|| actix_web::App::new().route("/", actix_web::web::get().to(index)))
        .bind("127.0.0.1:4000")?
        .run()
        .await
}
