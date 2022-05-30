import { useStore } from 'pinia';

export default {
    setup() {
        const encounter = useStore();

        return {
            encounter,
        }
    }
}