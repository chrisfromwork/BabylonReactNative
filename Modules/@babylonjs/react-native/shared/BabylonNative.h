#pragma once

#include <jsi/jsi.h>

namespace Babylon
{
    using Dispatcher = std::function<void(std::function<void()>)>;

    void Initialize(facebook::jsi::Runtime& jsiRuntime, Dispatcher jsDispatcher);
    void Deinitialize();
    void UpdateView(void* windowPtr, size_t width, size_t height);
    void SetPointerButtonState(uint32_t pointerId, uint32_t buttonId, bool isDown, uint32_t x, uint32_t y);
    void SetPointerPosition(uint32_t pointerId, uint32_t x, uint32_t y);
}
