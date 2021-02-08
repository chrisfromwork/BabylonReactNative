#include "pch.h"
#include "BabylonModule.h"
#include <winrt/BabylonNative.h>

using namespace winrt::BabylonNative;
using namespace winrt::BabylonReactNative::implementation;

REACT_INIT(Initialize);
void BabylonModule::Initialize(const winrt::Microsoft::ReactNative::ReactContext& reactContext) noexcept
{
    _reactContext = reactContext;
}

REACT_METHOD(CustomInitialize, L"initialize");
void BabylonModule::CustomInitialize(const winrt::Microsoft::ReactNative::ReactPromise<bool>& result) noexcept
{
    _initializePromises.push_back(result);
    BabylonNativeInterop::Initialize(_reactContext.Handle(), InitializeCompletedHandler{ this, &BabylonModule::OnInitializeCompleted });
}

void BabylonModule::OnInitializeCompleted(bool success)
{
    for (const auto& promise : _initializePromises)
    {
        promise.Resolve(success);
    }

    _initializePromises.clear();
}