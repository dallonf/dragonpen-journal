#[macro_use]
extern crate lazy_static;

use juniper::EmptyMutation;

pub struct Query;
#[juniper::object]
impl Query {
    fn hello() -> String {
        "Hello, GraphQL!".into()
    }
}

type Schema = juniper::RootNode<'static, Query, EmptyMutation<()>>;

lazy_static! {
    pub static ref SCHEMA: Schema = Schema::new(Query, EmptyMutation::new());
}

#[cfg(test)]
mod tests {
    use super::*;
    use juniper::{graphql_value, Variables};

    #[test]
    fn query() {
        let result = juniper::execute("{ hello }", None, &SCHEMA, &Variables::new(), &()).unwrap();

        assert_eq!(
            result.0,
            graphql_value!({
                "hello": "Hello, GraphQL!"
            })
        );
    }
}
