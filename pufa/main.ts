import {openApp} from "./openScript";
import {AUTODELAYMS, CONFIDENCE, DEFAULT_RESOURCE_DIRECTORY, MOUSESPEED} from "./config";
import "@nut-tree/nl-matcher";
import {mouse, screen} from "@nut-tree/nut-js";
import path from "path";

screen.config.confidence = CONFIDENCE
screen.config.resourceDirectory = path.resolve(DEFAULT_RESOURCE_DIRECTORY)
mouse.config.mouseSpeed = MOUSESPEED
mouse.config.autoDelayMs = AUTODELAYMS

await openApp()
