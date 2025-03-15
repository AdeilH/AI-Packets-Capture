import asyncio
import pyshark
import contextlib

# Global event loop for PyShark
_pyshark_loop = None

def get_pyshark_eventloop():
    """Get a dedicated event loop for PyShark operations"""
    global _pyshark_loop
    if _pyshark_loop is None:
        _pyshark_loop = asyncio.new_event_loop()
    return _pyshark_loop

@contextlib.contextmanager
def safe_pyshark_capture(capture_file, **kwargs):
    """Context manager for safely handling PyShark captures"""
    loop = get_pyshark_eventloop()
    cap = pyshark.FileCapture(capture_file, eventloop=loop, **kwargs)
    
    try:
        yield cap
    finally:
        # Properly close the capture
        if hasattr(cap, '_packets'):
            cap._packets.clear()
        with contextlib.suppress(Exception):
            if hasattr(cap, 'close'):
                if asyncio.iscoroutinefunction(cap.close):
                    future = asyncio.run_coroutine_threadsafe(cap.close(), loop)
                    future.result(timeout=5)
                else:
                    cap.close() 