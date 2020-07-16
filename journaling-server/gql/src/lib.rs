#[macro_use]
extern crate lazy_static;

use juniper::{FieldResult};
use std::convert::TryFrom;

pub struct Ctx(pub model::ModelState);
impl juniper::Context for Ctx {}

pub struct Query;
#[juniper::object(
    Context = Ctx
)]
impl Query {
    fn hello() -> String {
        "Hello, GraphQL!".into()
    }
    fn counter(context: &Ctx) -> FieldResult<i32> {
        Ok(i32::try_from(context.0.get_counter())?)
    }
}

pub struct Mutation;
#[juniper::object(
    Context = Ctx
)]
impl Mutation {
    fn counter_increment(context: &Ctx) -> FieldResult<i32> {
        let result = context.0.increment_counter();
        Ok(i32::try_from(result)?)
    }
}

type Schema = juniper::RootNode<'static, Query, Mutation>;

lazy_static! {
    pub static ref SCHEMA: Schema = Schema::new(Query, Mutation);
}

#[cfg(test)]
mod tests {
    use super::*;
    use juniper::{graphql_value, Variables};

    fn make_context() -> Ctx {
        Ctx(model::ModelState::new())
    }

    #[test]
    fn query() {
        let result = juniper::execute(
            "{ hello }",
            None,
            &SCHEMA,
            &Variables::new(),
            &make_context(),
        )
        .unwrap();

        assert_eq!(
            result.0,
            graphql_value!({
                "hello": "Hello, GraphQL!"
            })
        );
    }
}
