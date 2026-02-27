import { ThreeElements } from '@react-three/fiber';

declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements extends ThreeElements { }
        }
    }

    // Also include the legacy global namespace fallback for some editors
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}
