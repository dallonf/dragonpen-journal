#[macro_use]
extern crate lazy_static;

use async_graphql as gql;
use std::convert::TryFrom;

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

pub type Schema = gql::Schema<Query, Mutation, gql::EmptySubscription>;

lazy_static! {
    pub static ref SCHEMA: Schema = gql::Schema::new(Query, Mutation, gql::EmptySubscription);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[actix_rt::test]
    async fn query() {
        let schema = gql::Schema::build(Query, Mutation, gql::EmptySubscription).finish();

        let result = gql::QueryBuilder::new("{ hello }")
            .data(model::ModelState::new())
            .execute(&schema)
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
