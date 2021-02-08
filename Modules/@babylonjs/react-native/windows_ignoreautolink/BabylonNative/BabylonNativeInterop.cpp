#include "pch.h"

#include "BabylonNativeInterop.h"
#if __has_include("BabylonNativeInterop.g.cpp")
#include "BabylonNativeInterop.g.cpp"
#endif

#include "BabylonNative.h"
#include "jsi/JsiApiContext.h"

using namespace winrt::Microsoft::ReactNative;
using namespace winrt::Windows::UI::Xaml::Controls;

namespace winrt::BabylonNative::implementation
{
    void BabylonNativeInterop::Initialize(IReactContext reactContext, InitializeCompletedHandler callback)
    {
        ExecuteJsi(reactContext, [reactContext, callback](facebook::jsi::Runtime& jsiRuntime) {
            auto jsDispatcher = [reactContext, callback](std::function<void()> func)
            {
                reactContext.JSDispatcher().Post([func{ std::move(func) }]() {
                    func();
                });
            };
            Babylon::Initialize(jsiRuntime, jsDispatcher, false);
            callback(true);
        });
    }

    void BabylonNativeInterop::Deinitialize()
    {
        Babylon::Deinitialize();
    }

    void BabylonNativeInterop::UpdateView(SwapChainPanel swapChainPanel, uint32_t width, uint32_t height)
    {
        // Use windowTypePtr == 2 for xaml swap chain panels
        auto windowTypePtr = reinterpret_cast<void*>(2);
        auto windowPtr = winrt::get_abi(swapChainPanel);
        Babylon::UpdateView(windowPtr, width, height, windowTypePtr);
    }

    void BabylonNativeInterop::RenderView()
    {
        Babylon::RenderView();
    }

    void BabylonNativeInterop::SetMouseButtonState(uint32_t buttonId, bool isDown, uint32_t x, uint32_t y)
    {
        Babylon::SetMouseButtonState(buttonId, isDown, x, y);
    }

    void BabylonNativeInterop::SetMousePosition(uint32_t x, uint32_t y)
    {
        Babylon::SetMousePosition(x, y);
    }

    void BabylonNativeInterop::SetTouchButtonState(uint32_t pointerId, bool isDown, uint32_t x, uint32_t y)
    {
        Babylon::SetTouchButtonState(pointerId, isDown, x, y);
    }

    void BabylonNativeInterop::SetTouchPosition(uint32_t pointerId, uint32_t x, uint32_t y)
    {
        Babylon::SetTouchPosition(pointerId, x, y);
    }

    uint32_t BabylonNativeInterop::LeftMouseButtonId()
    {
        return Babylon::LEFT_MOUSE_BUTTON_ID;
    }
    
    uint32_t BabylonNativeInterop::MiddleMouseButtonId()
    {
        return Babylon::MIDDLE_MOUSE_BUTTON_ID;
    }

    uint32_t BabylonNativeInterop::RightMouseButtonId()
    {
        return Babylon::RIGHT_MOUSE_BUTTON_ID;
    }
}
