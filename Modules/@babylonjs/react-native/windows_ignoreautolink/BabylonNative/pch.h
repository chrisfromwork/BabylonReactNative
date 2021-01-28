#pragma once

// Note this pch.h is referenced different places but this dll doesn't use a precompiled header. BabylonNative.cpp is shared and shouldn't be forced to consume pch.h
#include <unknwn.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>