use std::sync;

#[derive(Clone)]
pub struct ModelState {
    pub counter: sync::Arc<sync::atomic::AtomicUsize>,
}
impl ModelState {
    pub fn new() -> Self {
        ModelState {
            counter: sync::Arc::new(sync::atomic::AtomicUsize::new(0)),
        }
    }

    pub fn get_counter(&self) -> usize {
        self.counter.load(sync::atomic::Ordering::Relaxed)
    }

    pub fn increment_counter(&self) -> usize {
        self.counter.fetch_add(1, sync::atomic::Ordering::Relaxed) + 1
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let state = ModelState::new();
        assert_eq!(state.get_counter(), 0);
        assert_eq!(state.increment_counter(), 1);
        assert_eq!(state.get_counter(), 1);
        assert_eq!(state.increment_counter(), 2);
        assert_eq!(state.get_counter(), 2);
    }
}
