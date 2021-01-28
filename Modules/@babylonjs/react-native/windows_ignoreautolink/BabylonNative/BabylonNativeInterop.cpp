#include "pch.h"

#include "BabylonNativeInterop.h"
#if __has_include("BabylonNativeInterop.g.cpp")
#include "BabylonNativeInterop.g.cpp"
#endif

#include "BabylonNative.h"
#include "JSI/JsiApi.h"

using namespace winrt::Microsoft::ReactNative;
using namespace winrt::Windows::UI::Xaml::Controls;

namespace winrt::BabylonNative::implementation
{
    void BabylonNativeInterop::Initialize(IReactContext reactContext, InitializeCompletedHandler callback)
    {
        winrt::Microsoft::ReactNative::ExecuteJsi(reactContext, [reactContext, callback](facebook::jsi::Runtime& jsiRuntime) {
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

    void BabylonNativeInterop::SetPointerButtonState(uint32_t pointerId, uint32_t buttonId, bool isDown, uint32_t x, uint32_t y)
    {
        Babylon::SetPointerButtonState(pointerId, buttonId, isDown, x, y);
    }

    void BabylonNativeInterop::SetPointerPosition(uint32_t pointerId, uint32_t x, uint32_t y)
    {
        Babylon::SetPointerPosition(pointerId, x, y);
    }
}
