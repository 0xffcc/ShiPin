/*
 * Copyright (C) 2017 Baidu, Inc. All Rights Reserved.
 */
package com.douya.shipin;

import android.app.Application;
import android.content.Context;
import android.os.Build;
import android.os.StrictMode;
import android.support.multidex.MultiDex;



/**
 * Created by penglei on 2018/12/25.
 */
public class App extends Application {

    private static App appInstance;
    private static Context mContext;



    @Override
    public void onCreate() {
        super.onCreate();

        MultiDex.install(this);
        mContext = getApplicationContext();
        appInstance = this;

//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
//            StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
//            StrictMode.setVmPolicy(builder.build());
//        }



    }

    public static Context getContext() {
        return mContext;
    }

    public static App getAppInstance(){
        return appInstance;
    }


    public static App getIntstance() {
        if (appInstance == null) {
            appInstance = new App();
        }
        return appInstance;
    }

}
