package com.safecircle.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "DiscreetLauncher")
public class DiscreetModePlugin extends Plugin {

    @PluginMethod
    public void setLauncherMode(PluginCall call) {
        String mode = call.getString("mode", "normal");
        Context context = getContext();
        PackageManager pm = context.getPackageManager();
        String packageName = context.getPackageName();

        ComponentName defaultAlias = new ComponentName(packageName, packageName + ".MainActivityDefault");
        ComponentName calcAlias = new ComponentName(packageName, packageName + ".MainActivityCalculator");
        ComponentName notesAlias = new ComponentName(packageName, packageName + ".MainActivityNotes");

        try {
            int defaultState = "normal".equalsIgnoreCase(mode) 
                ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED 
                : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;
            int calcState = "calculator".equalsIgnoreCase(mode) 
                ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED 
                : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;
            int notesState = ("neutral".equalsIgnoreCase(mode) || "notes".equalsIgnoreCase(mode))
                ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED 
                : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;

            pm.setComponentEnabledSetting(defaultAlias, defaultState, PackageManager.DONT_KILL_APP);
            pm.setComponentEnabledSetting(calcAlias, calcState, PackageManager.DONT_KILL_APP);
            pm.setComponentEnabledSetting(notesAlias, notesState, PackageManager.DONT_KILL_APP);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("activeMode", mode);
            ret.put("note", "Launcher identity updated. Android launcher refresh timing varies by device.");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update launcher alias: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getLauncherMode(PluginCall call) {
        Context context = getContext();
        PackageManager pm = context.getPackageManager();
        String packageName = context.getPackageName();

        ComponentName calcAlias = new ComponentName(packageName, packageName + ".MainActivityCalculator");
        ComponentName notesAlias = new ComponentName(packageName, packageName + ".MainActivityNotes");

        int calcState = pm.getComponentEnabledSetting(calcAlias);
        int notesState = pm.getComponentEnabledSetting(notesAlias);

        String mode = "normal";
        if (calcState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED) {
            mode = "calculator";
        } else if (notesState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED) {
            mode = "neutral";
        }

        JSObject ret = new JSObject();
        ret.put("mode", mode);
        call.resolve(ret);
    }
}
