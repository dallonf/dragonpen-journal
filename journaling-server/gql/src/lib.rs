#[macro_use]
extern crate lazy_static;

use async_graphql as gql;
use std::convert::TryFrom;
use tokio::stream::Stream;
use tokio::stream::StreamExt;

trait ContextUtils {
    fn get_model_state(&self) -> &model::ModelState;
}
impl ContextUtils for gql::Context<'_> {
    fn get_model_state(&self) -> &model::ModelState {
        self.data().unwrap()
    }
}

pub struct Query;
#[gql::Object]
impl Query {
    #[field]
    async fn hello(&self) -> String {
        "Hello, GraphQL!".into()
    }
    #[field]
    async fn counter(&self, ctx: &gql::Context<'_>) -> gql::FieldResult<i32> {
        Ok(i32::try_from(ctx.get_model_state().get_counter())?)
    }
}

pub struct Mutation;
#[gql::Object]
impl Mutation {
    #[field]
    async fn counter_increment(&self, ctx: &gql::Context<'_>) -> gql::FieldResult<i32> {
        let result = ctx.get_model_state().increment_counter();
        Ok(i32::try_from(result)?)
    }
}

pub struct Subscription;
#[gql::Subscription]
impl Subscription {
    async fn integers(&self, #[arg(default = 1)] step: i32) -> impl Stream<Item = i32> {
        let mut value = 0;
        actix_rt::time::interval(std::time::Duration::from_secs(1)).map(move |_| {
            value += step;
            value
        })
    }
}

pub type Schema = gql::Schema<Query, Mutation, Subscription>;

lazy_static! {
    pub static ref SCHEMA: Schema = gql::Schema::new(Query, Mutation, Subscription);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[actix_rt::test]
    async fn query() {
        let result = gql::QueryBuilder::new("{ hello }")
            .data(model::ModelState::new())
            .execute(&SCHEMA)
            .await
            .unwrap();

        assert_eq!(
            result.data,
            serde_json::json!({
                "hello": "Hello, GraphQL!"
            })
        );
    }
}
